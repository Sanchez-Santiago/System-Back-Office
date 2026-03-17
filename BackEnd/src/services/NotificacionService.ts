// BackEnd/src/services/NotificacionService.ts
// ============================================
// Servicio para crear notificaciones por país
// ============================================

import { PostgresClient } from "../database/PostgreSQL.ts";
import { logger } from "../Utils/logger.ts";

export class NotificacionService {
  private pgClient: PostgresClient;

  constructor(pgClient: PostgresClient) {
    this.pgClient = pgClient;
  }

  /**
   * Crea una notificación y la envía a usuarios específicos
   */
  async crearNotificacion(params: {
    tipo: "NOTIFICACION" | "ALERTA";
    titulo: string;
    comentario: string;
    usuarioCreadorId: string;
    destinatariosIds?: string[];
    referenciaId?: number;
  }): Promise<number> {
    const { tipo, titulo, comentario, usuarioCreadorId, destinatariosIds, referenciaId } = params;
    const client = this.pgClient.getClient();

    try {
      // Crear el mensaje
      const result = await client.queryObject(
        `INSERT INTO mensaje (tipo, titulo, comentario, usuario_creador_id, referencia_id, fecha_creacion)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING mensaje_id`,
        [tipo, titulo, comentario, usuarioCreadorId, referenciaId || null, new Date()]
      );

      const mensajeId = result.rows[0]?.mensaje_id;
      if (!mensajeId) {
        throw new Error("Error al crear el mensaje");
      }

      // Si hay destinatarios específicos, crear registros
      if (destinatariosIds && destinatariosIds.length > 0) {
        for (const usuarioId of destinatariosIds) {
          await client.queryObject(
            `INSERT INTO mensaje_destinatario (mensaje_id, usuario_id, leida)
             VALUES ($1, $2, false)`,
            [mensajeId, usuarioId]
          );
        }
      }

      logger.info(`Notificación ${mensajeId} creada exitosamente para ${destinatariosIds?.length || 0} destinatarios`);
      return mensajeId;
    } catch (error) {
      logger.error("NotificacionService.crearNotificacion:", error);
      throw error;
    }
  }

  /**
   * Crea una notificación y la envía a todos los usuarios de células de un país específico
   */
  async crearNotificacionPorPais(params: {
    tipo: "NOTIFICACION" | "ALERTA";
    titulo: string;
    comentario: string;
    usuarioCreadorId: string;
    pais: string;
    referenciaId?: number;
  }): Promise<number> {
    const { tipo, titulo, comentario, usuarioCreadorId, pais, referenciaId } = params;
    const client = this.pgClient.getClient();

    try {
      // Obtener usuarios de células que vendan en el país especificado
      const usuariosResult = await client.queryObject(
        `SELECT DISTINCT u.persona_id
         FROM usuario u
         INNER JOIN celula c ON u.celula = c.id_celula
         WHERE c.pais_venta ILIKE $1
         AND u.estado = 'ACTIVO'
         AND u.rol IN ('VENDEDOR', 'SUPERVISOR', 'BACK_OFFICE')`,
        [pais]
      );

      const destinatariosIds = usuariosResult.rows.map((row: any) => row.persona_id);

      if (destinatariosIds.length === 0) {
        logger.warn(`No se encontraron usuarios para el país: ${pais}`);
        return 0;
      }

      // Crear el mensaje
      const mensajeResult = await client.queryObject(
        `INSERT INTO mensaje (tipo, titulo, comentario, usuario_creador_id, referencia_id, fecha_creacion)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING mensaje_id`,
        [tipo, titulo, comentario, usuarioCreadorId, referenciaId || null, new Date()]
      );

      const mensajeId = mensajeResult.rows[0]?.mensaje_id;
      if (!mensajeId) {
        throw new Error("Error al crear el mensaje");
      }

      // Crear registros de destinatarios
      for (const usuarioId of destinatariosIds) {
        await client.queryObject(
          `INSERT INTO mensaje_destinatario (mensaje_id, usuario_id, leida)
           VALUES ($1, $2, false)`,
          [mensajeId, usuarioId]
        );
      }

      logger.info(`Notificación ${mensajeId} creada para país ${pais} con ${destinatariosIds.length} destinatarios`);
      return mensajeId;
    } catch (error) {
      logger.error("NotificacionService.crearNotificacionPorPais:", error);
      throw error;
    }
  }

  /**
   * Obtiene el país de una empresa origen por su ID
   */
  async getPaisByEmpresaOrigenId(empresaOrigenId: number): Promise<string | null> {
    const client = this.pgClient.getClient();

    try {
      const result = await client.queryObject(
        `SELECT pais FROM empresa_origen WHERE empresa_origen_id = $1`,
        [empresaOrigenId]
      );
      return result.rows[0]?.pais || null;
    } catch (error) {
      logger.error("NotificacionService.getPaisByEmpresaOrigenId:", error);
      return null;
    }
  }

  /**
   * Notifica cuando se crea/actualiza un plan
   */
  async notificarPlan(params: {
    accion: "CREAR" | "ACTUALIZAR" | "ACTIVAR" | "DESACTIVAR";
    planId: number;
    planNombre: string;
    empresaOrigenId: number;
    usuarioCreadorId: string;
  }): Promise<number> {
    const { accion, planId, planNombre, empresaOrigenId, usuarioCreadorId } = params;

    const pais = await this.getPaisByEmpresaOrigenId(empresaOrigenId);
    if (!pais) {
      logger.warn(`No se encontró país para empresa origen ${empresaOrigenId}`);
      return 0;
    }

    const titulo = `${accion === "CREAR" ? "Nuevo Plan" : accion === "ACTUALIZAR" ? "Plan Actualizado" : accion === "ACTIVAR" ? "Plan Activado" : "Plan Desactivado"}: ${planNombre}`;
    const comentario = `Se ha ${accion === "CREAR" ? "creado" : accion === "ACTUALIZAR" ? "actualizado" : accion === "ACTIVAR" ? "activado" : "desactivado"} el plan "${planNombre}" para ${pais}.`;

    return this.crearNotificacionPorPais({
      tipo: "NOTIFICACION",
      titulo,
      comentario,
      usuarioCreadorId,
      pais,
      referenciaId: planId,
    });
  }

  /**
   * Notifica cuando se crea/actualiza una promoción
   */
  async notificarPromocion(params: {
    accion: "CREAR" | "ACTUALIZAR" | "ACTIVAR" | "DESACTIVAR";
    promocionId: number;
    promocionNombre: string;
    empresaOrigenId: number;
    usuarioCreadorId: string;
  }): Promise<number> {
    const { accion, promocionId, promocionNombre, empresaOrigenId, usuarioCreadorId } = params;

    const pais = await this.getPaisByEmpresaOrigenId(empresaOrigenId);
    if (!pais) {
      logger.warn(`No se encontró país para empresa origen ${empresaOrigenId}`);
      return 0;
    }

    const titulo = `${accion === "CREAR" ? "Nueva Promoción" : accion === "ACTUALIZAR" ? "Promoción Actualizada" : accion === "ACTIVAR" ? "Promoción Activada" : "Promoción Desactivada"}: ${promocionNombre}`;
    const comentario = `Se ha ${accion === "CREAR" ? "creado" : accion === "ACTUALIZAR" ? "actualizado" : accion === "ACTIVAR" ? "activado" : "desactivado"} la promoción "${promocionNombre}" para ${pais}.`;

    return this.crearNotificacionPorPais({
      tipo: "NOTIFICACION",
      titulo,
      comentario,
      usuarioCreadorId,
      pais,
      referenciaId: promocionId,
    });
  }

  /**
   * Notifica cuando se crea/actualiza una empresa origen
   */
  async notificarEmpresaOrigen(params: {
    accion: "CREAR" | "ACTUALIZAR";
    empresaOrigenId: number;
    empresaOrigenNombre: string;
    pais: string;
    usuarioCreadorId: string;
  }): Promise<number> {
    const { accion, empresaOrigenId, empresaOrigenNombre, pais, usuarioCreadorId } = params;

    const titulo = `${accion === "CREAR" ? "Nueva Empresa Origen" : "Empresa Origen Actualizada"}: ${empresaOrigenNombre}`;
    const comentario = `Se ha ${accion === "CREAR" ? "creado" : "actualizado"} la empresa "${empresaOrigenNombre}" en ${pais}.`;

    return this.crearNotificacionPorPais({
      tipo: "NOTIFICACION",
      titulo,
      comentario,
      usuarioCreadorId,
      pais,
      referenciaId: empresaOrigenId,
    });
  }
}
