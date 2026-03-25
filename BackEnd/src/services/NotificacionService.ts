// BackEnd/src/services/NotificacionService.ts
// ============================================
// Servicio para crear notificaciones dinámicas
// Notifica a todos los usuarios o según país de venta
// ============================================

import { PostgresClient } from "../database/PostgreSQL";
import { logger } from "../Utils/logger";

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
   * Crea notificación GLOBAL que llega a:
   * 1. Usuarios cuyas células tienen el país especificado
   * 2. Usuarios cuyas células NO tienen país (reciben todas las notificaciones)
   */
  async crearNotificacionGlobal(params: {
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
      // Obtener usuarios ACTIVOS cuyas células tienen el país específico
      const usuariosConPais = await client.queryObject(
        `SELECT DISTINCT u.persona_id
         FROM usuario u
         INNER JOIN celula c ON u.celula = c.id_celula
         WHERE c.pais_venta ILIKE $1
         AND u.estado = 'ACTIVO'`,
        [pais]
      );

      // Obtener usuarios ACTIVOS cuyas células NO tienen país (reciben TODAS las notificaciones)
      const usuariosSinPais = await client.queryObject(
        `SELECT DISTINCT u.persona_id
         FROM usuario u
         INNER JOIN celula c ON u.celula = c.id_celula
         WHERE (c.pais_venta IS NULL OR c.pais_venta = '')
         AND u.estado = 'ACTIVO'`
      );

      // Combinar y deduplicar destinatarios
      const destinatariosMap = new Map<string, boolean>();
      [...usuariosConPais.rows, ...usuariosSinPais.rows].forEach((row: any) => {
        destinatariosMap.set(row.persona_id, true);
      });
      const destinatariosIds = Array.from(destinatariosMap.keys());

      if (destinatariosIds.length === 0) {
        logger.warn(`No se encontraron usuarios para notificación global país: ${pais}`);
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

      logger.info(`Notificación global ${mensajeId} creada para país ${pais} con ${destinatariosIds.length} destinatarios`);
      return mensajeId;
    } catch (error) {
      logger.error("NotificacionService.crearNotificacionGlobal:", error);
      throw error;
    }
  }

  /**
   * Crea una notificación y la envía a todos los usuarios de células de un país específico
   * (Método legacy - usar crearNotificacionGlobal para nueva funcionalidad)
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
      const usuariosResult = await client.queryObject(
        `SELECT DISTINCT u.persona_id
         FROM usuario u
         INNER JOIN celula c ON u.celula = c.id_celula
         WHERE c.pais_venta ILIKE $1
         AND u.estado = 'ACTIVO'`,
        [pais]
      );

      const destinatariosIds = usuariosResult.rows.map((row: any) => row.persona_id);

      if (destinatariosIds.length === 0) {
        logger.warn(`No se encontraron usuarios para el país: ${pais}`);
        return 0;
      }

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
   * Notifica cuando se crea/actualiza/activa/desactiva un plan
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

    const titulo = this.getTituloPlan(accion, planNombre);
    const comentario = this.getComentarioPlan(accion, planNombre, pais);

    return this.crearNotificacionGlobal({
      tipo: "NOTIFICACION",
      titulo,
      comentario,
      usuarioCreadorId,
      pais,
      referenciaId: planId,
    });
  }

  /**
   * Notifica cuando se crea/actualiza/activa/desactiva una promoción
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

    const titulo = this.getTituloPromocion(accion, promocionNombre);
    const comentario = this.getComentarioPromocion(accion, promocionNombre, pais);

    return this.crearNotificacionGlobal({
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

    const titulo = this.getTituloEmpresa(accion, empresaOrigenNombre);
    const comentario = this.getComentarioEmpresa(accion, empresaOrigenNombre, pais);

    return this.crearNotificacionGlobal({
      tipo: "NOTIFICACION",
      titulo,
      comentario,
      usuarioCreadorId,
      pais,
      referenciaId: empresaOrigenId,
    });
  }

  // ============================================
  // HELPERS PARA CONSTRUIR MENSAJES
  // ============================================

  private getTituloPlan(accion: string, nombre: string): string {
    switch (accion) {
      case "CREAR": return `Nuevo Plan: ${nombre}`;
      case "ACTUALIZAR": return `Plan Actualizado: ${nombre}`;
      case "ACTIVAR": return `Plan Activado: ${nombre}`;
      case "DESACTIVAR": return `Plan Desactivado: ${nombre}`;
      default: return `Plan: ${nombre}`;
    }
  }

  private getComentarioPlan(accion: string, nombre: string, pais: string): string {
    switch (accion) {
      case "CREAR": return `Se ha creado el nuevo plan "${nombre}" disponible en ${pais}.`;
      case "ACTUALIZAR": return `El plan "${nombre}" ha sido actualizado para ${pais}.`;
      case "ACTIVAR": return `El plan "${nombre}" está ahora activo en ${pais}.`;
      case "DESACTIVAR": return `El plan "${nombre}" ha sido desactivado en ${pais}.`;
      default: return `El plan "${nombre}" en ${pais} ha sido modificado.`;
    }
  }

  private getTituloPromocion(accion: string, nombre: string): string {
    switch (accion) {
      case "CREAR": return `Nueva Promoción: ${nombre}`;
      case "ACTUALIZAR": return `Promoción Actualizada: ${nombre}`;
      case "ACTIVAR": return `Promoción Activada: ${nombre}`;
      case "DESACTIVAR": return `Promoción Desactivada: ${nombre}`;
      default: return `Promoción: ${nombre}`;
    }
  }

  private getComentarioPromocion(accion: string, nombre: string, pais: string): string {
    switch (accion) {
      case "CREAR": return `Se ha creado la nueva promoción "${nombre}" disponible en ${pais}.`;
      case "ACTUALIZAR": return `La promoción "${nombre}" ha sido actualizada para ${pais}.`;
      case "ACTIVAR": return `La promoción "${nombre}" está ahora activa en ${pais}.`;
      case "DESACTIVAR": return `La promoción "${nombre}" ha sido desactivada en ${pais}.`;
      default: return `La promoción "${nombre}" en ${pais} ha sido modificada.`;
    }
  }

  private getTituloEmpresa(accion: string, nombre: string): string {
    switch (accion) {
      case "CREAR": return `Nueva Empresa: ${nombre}`;
      case "ACTUALIZAR": return `Empresa Actualizada: ${nombre}`;
      default: return `Empresa: ${nombre}`;
    }
  }

  private getComentarioEmpresa(accion: string, nombre: string, pais: string): string {
    switch (accion) {
      case "CREAR": return `Se ha registrado la nueva empresa "${nombre}" en ${pais}.`;
      case "ACTUALIZAR": return `La empresa "${nombre}" ha sido actualizada.`;
      default: return `La empresa "${nombre}" en ${pais} ha sido modificada.`;
    }
  }
}
