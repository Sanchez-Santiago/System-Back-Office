// ============================================
// BackEnd/src/model/estadoCorreoPostgreSQL.ts
// ============================================
import { EstadoCorreoModelDB } from "../interface/estadoCorreo.ts";
import {
  EstadoCorreo,
  EstadoCorreoCreate,
  EstadoCorreoUpdate,
} from "../schemas/correo/EstadoCorreo.ts";
import { ResilientPostgresConnection } from "../database/PostgreSQL.ts";
import { logger } from "../Utils/logger.ts";

/**
 * Modelo de Estado de Correo para PostgreSQL con manejo resiliente
 * Gestiona el tracking y seguimiento de correos
 */
export class EstadoCorreoPostgreSQL implements EstadoCorreoModelDB {
  connection: ResilientPostgresConnection;

  constructor(connection: ResilientPostgresConnection) {
    this.connection = connection;
  }

  private async safeQuery<T>(
    query: string, 
    params: any[] = []
  ): Promise<T> {
    try {
      return await this.connection.query(query, params);
    } catch (error) {
      logger.error("EstadoCorreoPostgreSQL.safeQuery:", error);
      throw error;
    }
  }

  // ======================================================
  // OBTENER TODOS LOS ESTADOS CON PAGINACIÓN
  // ✅ Solo muestra el ÚLTIMO estado de cada correo (sin duplicados)
  // ======================================================
  async getAll(params: {
    page?: number;
    limit?: number;
    name?: string;
    email?: string;
  }): Promise<EstadoCorreo[] | undefined> {
    try {
      const { page = 1, limit = 10 } = params;
      const offset = (page - 1) * limit;

      // Query con ROW_NUMBER() para obtener solo el último estado de cada SAP
      const query = `
        SELECT
          estado_correo_id,
          sap_id,
          entregado_ok,
          estado_guia,
          ultimo_evento_fecha,
          ubicacion_actual,
          primera_visita,
          fecha_primer_visita
        FROM (
          SELECT ec.*,
                 ROW_NUMBER() OVER (
                     PARTITION BY sap_id
                     ORDER BY ultimo_evento_fecha DESC, estado_correo_id DESC
                 ) AS rn
          FROM estado_correo ec
        ) t
        WHERE rn = 1
        ORDER BY ultimo_evento_fecha DESC
        LIMIT $1 OFFSET $2
      `;

      const queryParams: (string | number)[] = [limit, offset];

      logger.debug(
        "getAll estados correo (último por SAP) - Query:",
        query,
      );

      const result = await this.safeQuery<EstadoCorreo[]>(query, queryParams);

      if (!result || result.length === 0) {
        return undefined;
      }

      return result;
    } catch (error) {
      logger.error("EstadoCorreoPostgreSQL.getAll:", error);
      throw error;
    }
  }

  // ======================================================
  // OBTENER ESTADO POR ID
  // ======================================================
  async getById({ id }: { id: string }): Promise<EstadoCorreo | undefined> {
    try {
      logger.debug(`getById estado correo: ${id}`);
      const idConsulta = parseInt(id);

      const result = await this.safeQuery<EstadoCorreo[]>(
        `
        SELECT
          estado_correo_id,
          sap_id,
          entregado_ok,
          estado_guia,
          ultimo_evento_fecha,
          ubicacion_actual,
          primera_visita,
          fecha_primer_visita
        FROM estado_correo
        WHERE estado_correo_id = $1
        ORDER BY ultimo_evento_fecha DESC
        LIMIT 1
        `,
        [idConsulta],
      );

      if (!result || result.length === 0) {
        return undefined;
      }

      return result[0];
    } catch (error) {
      logger.error("EstadoCorreoPostgreSQL.getById:", error);
      throw error;
    }
  }

  // ======================================================
  // OBTENER ESTADO POR SAP
  // ======================================================
  async getBySAP(
    { sap }: { sap: string },
  ): Promise<EstadoCorreo[] | undefined> {
    try {
      logger.debug(`getBySAP estado correo: ${sap}`);

      const result = await this.safeQuery<EstadoCorreo[]>(
        `
        SELECT
          ec.estado_correo_id,
          ec.sap_id,
          ec.entregado_ok,
          ec.estado_guia,
          ec.ultimo_evento_fecha,
          ec.ubicacion_actual,
          ec.primera_visita,
          ec.fecha_primer_visita
        FROM estado_correo ec
        INNER JOIN correo c ON ec.sap_id = c.sap_id
        WHERE c.sap_id = $1
        ORDER BY ec.ultimo_evento_fecha DESC;
        `,
        [sap],
      );

      if (!result || result.length === 0) {
        return undefined;
      }

      return result;
    } catch (error) {
      logger.error("EstadoCorreoPostgreSQL.getBySAP:", error);
      throw error;
    }
  }

  async getLastBySAP(
    { sap }: { sap: string },
  ): Promise<EstadoCorreo | undefined> {
    try {
      logger.debug("getLastBySAP");

      const result = await this.safeQuery<EstadoCorreo[]>(
        `
        SELECT
          estado_correo_id,
          sap_id,
          entregado_ok,
          estado_guia,
          ultimo_evento_fecha,
          ubicacion_actual,
          primera_visita,
          fecha_primer_visita
        FROM estado_correo
        WHERE sap_id = $1
        ORDER BY ultimo_evento_fecha DESC
        LIMIT 1
        `,
        [sap],
      );

      if (!result || result.length === 0) {
        return undefined;
      }

      return result[0];
    } catch (error) {
      logger.error("EstadoCorreoPostgreSQL.getLastBySAP:", error);
      throw error;
    }
  }

  async getEntregados(): Promise<EstadoCorreo[]> {
    try {
      logger.debug("getEntregados");

      const result = await this.safeQuery<EstadoCorreo[]>(
        `
        SELECT *
        FROM (
          SELECT
            ec.*,
            ROW_NUMBER() OVER(
              PARTITION BY sap_id
              ORDER BY ultimo_evento_fecha DESC, estado_correo_id DESC
            ) AS rn
          FROM estado_correo ec
        ) t
        WHERE rn = 1
        AND entregado_ok = 1
        AND estado_guia NOT IN ('DEVUELTO', 'CANCELADO')
        ORDER BY ultimo_evento_fecha DESC;
        `,
      );

      if (!result || result.length === 0) {
        return [];
      }

      logger.debug(result);

      return result;
    } catch (error) {
      logger.error("EstadoCorreoPostgreSQL.getEntregados:", error);
      throw error;
    }
  }

  // ======================================================
  // OBTENER CORREOS NO ENTREGADOS
  // ======================================================
  async getNoEntregados(): Promise<EstadoCorreo[]> {
    try {
      logger.debug("getNoEntregados");

      const result = await this.safeQuery<EstadoCorreo[]>(
        `
        SELECT ec.*
        FROM estado_correo ec
        INNER JOIN (
          SELECT sap_id,
                 MAX(estado_correo_id) AS ultimo_id,
                 MAX(ultimo_evento_fecha) AS ultima_fecha
          FROM estado_correo
          GROUP BY sap_id
        ) ult
          ON ec.sap_id = ult.sap_id
          AND ec.estado_correo_id = ult.ultimo_id
          AND ec.ultimo_evento_fecha = ult.ultima_fecha
        WHERE ec.entregado_ok = 0
        AND ec.estado_guia NOT IN ('DEVUELTO', 'CANCELADO')
        ORDER BY ec.ultimo_evento_fecha DESC;
        `,
      );

      if (!result || result.length === 0) {
        return [];
      }

      return result;
    } catch (error) {
      logger.error("EstadoCorreoPostgreSQL.getNoEntregados:", error);
      throw error;
    }
  }

  // ======================================================
  // OBTENER CORREOS DEVUELTOS
  // ======================================================
  async getDevueltos(): Promise<EstadoCorreo[]> {
    try {
      logger.debug("getDevueltos");

      const result = await this.safeQuery<EstadoCorreo[]>(
        `
        SELECT ec.*
        FROM estado_correo ec
        INNER JOIN (
          SELECT
            sap_id,
            MAX(estado_correo_id) AS ultimo_id,
            MAX(ultimo_evento_fecha) AS ultima_fecha
          FROM estado_correo
          GROUP BY sap_id
        ) ult
          ON ec.sap_id = ult.sap_id
          AND ec.estado_correo_id = ult.ultimo_id
          AND ec.ultimo_evento_fecha = ult.ultima_fecha
        WHERE
          ec.estado_guia = 'DEVUELTO'
          OR ec.ubicacion_actual ILIKE '%DEVUEL%'
        ORDER BY ec.ultimo_evento_fecha DESC;
        `,
      );

      if (!result || result.length === 0) {
        return [];
      }

      return result;
    } catch (error) {
      logger.error("EstadoCorreoPostgreSQL.getDevueltos:", error);
      throw error;
    }
  }

  // ======================================================
  // CREAR NUEVO ESTADO
  // ======================================================
  async add(params: { input: EstadoCorreoCreate }): Promise<EstadoCorreo> {
    try {
      const { input } = params;

      logger.info(`Creando estado correo para SAP: ${input.sap_id}`);

      // Insertar estado
      const result = await this.safeQuery<EstadoCorreo[]>(
        `
        INSERT INTO estado_correo (
          sap_id,
          entregado_ok,
          estado_guia,
          ultimo_evento_fecha,
          ubicacion_actual,
          primera_visita,
          fecha_primer_visita
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING estado_correo_id, sap_id, entregado_ok, estado_guia, ultimo_evento_fecha, ubicacion_actual, primera_visita, fecha_primer_visita
        `,
        [
          input.sap_id,
          input.entregado_ok || 0,
          input.estado_guia || "INICIAL",
          input.ultimo_evento_fecha,
          input.ubicacion_actual || "PENDIENTE",
          input.primera_visita || null,
          input.fecha_primer_visita || null,
        ],
      );

      if (!result || result.length === 0) {
        throw new Error("No se pudo crear el estado del correo");
      }

      const estado = result[0];
      logger.info(`Estado correo creado exitosamente: ${estado.estado_correo_id}`);

      return estado;
    } catch (error) {
      logger.error("EstadoCorreoPostgreSQL.add:", error);
      throw error;
    }
  }

  // ======================================================
  // ACTUALIZAR ESTADO
  // ======================================================
  async update(params: {
    id: string;
    input: Partial<EstadoCorreoUpdate>;
  }): Promise<EstadoCorreo | undefined> {
    try {
      const { id, input } = params;

      logger.info(`Actualizando estado correo: ${id}`);

      // Construir query dinámica
      const fields: string[] = [];
      const values: (string | number | Date | null)[] = [];
      let paramIndex = 1;

      if (input.entregado_ok !== undefined) {
        fields.push(`entregado_ok = $${paramIndex++}`);
        values.push(input.entregado_ok);
      }

      if (input.estado_guia !== undefined) {
        fields.push(`estado_guia = $${paramIndex++}`);
        values.push(input.estado_guia);
      }

      if (input.ultimo_evento_fecha !== undefined) {
        fields.push(`ultimo_evento_fecha = $${paramIndex++}`);
        values.push(input.ultimo_evento_fecha);
      }

      if (input.ubicacion_actual !== undefined) {
        fields.push(`ubicacion_actual = $${paramIndex++}`);
        values.push(input.ubicacion_actual);
      }

      if (input.primera_visita !== undefined) {
        fields.push(`primera_visita = $${paramIndex++}`);
        values.push(input.primera_visita);
      }

      if (input.fecha_primer_visita !== undefined) {
        fields.push(`fecha_primer_visita = $${paramIndex++}`);
        values.push(input.fecha_primer_visita);
      }

      if (fields.length === 0) {
        throw new Error("No hay campos para actualizar");
      }

      // Agregar ID al final
      values.push(id);

      // Ejecutar actualización
      const result = await this.safeQuery<EstadoCorreo[]>(
        `UPDATE estado_correo SET ${
          fields.join(", ")
        } WHERE estado_correo_id = $${paramIndex}
        RETURNING estado_correo_id, sap_id, entregado_ok, estado_guia, ultimo_evento_fecha, ubicacion_actual, primera_visita, fecha_primer_visita`,
        values,
      );

      logger.info(
        `Estado correo actualizado - ${result && result.length > 0 ? "Success" : "Failed"}`,
      );

      // Retornar estado actualizado
      if (result && result.length > 0) {
        return result[0];
      }

      return undefined;
    } catch (error) {
      logger.error("EstadoCorreoPostgreSQL.update:", error);
      throw error;
    }
  }

  // ======================================================
  // ELIMINAR ESTADO
  // ======================================================
  async delete(params: { id: string }): Promise<boolean> {
    try {
      const { id } = params;

      logger.info(`Eliminando estado correo: ${id}`);

      // Verificar que existe
      const estado = await this.getById({ id });
      if (!estado) {
        logger.warn(`Estado correo ${id} no encontrado`);
        return false;
      }

      // Eliminar estado
      const result = await this.safeQuery(
        `DELETE FROM estado_correo WHERE estado_correo_id = $1`,
        [id],
      );

      const success = Array.isArray(result) ? result.length > 0 : false;

      if (success) {
        logger.info(`Estado correo eliminado exitosamente: ${id}`);
      }

      return success;
    } catch (error) {
      logger.error("EstadoCorreoPostgreSQL.delete:", error);
      throw error;
    }
  }

  // ======================================================
  // MÉTODOS ADICIONALES
  // ======================================================

  /**
   * Obtiene estados por rango de fechas
   */
  async getByFechaRango(params: {
    fechaInicio: Date;
    fechaFin: Date;
  }): Promise<EstadoCorreo[]> {
    try {
      logger.debug(
        `getByFechaRango: ${params.fechaInicio} - ${params.fechaFin}`,
      );

      const result = await this.safeQuery<EstadoCorreo[]>(
        `
        SELECT
          estado_correo_id,
          sap_id,
          entregado_ok,
          estado_guia,
          ultimo_evento_fecha,
          ubicacion_actual,
          primera_visita,
          fecha_primer_visita
        FROM estado_correo
        WHERE ultimo_evento_fecha BETWEEN $1 AND $2
        ORDER BY ultimo_evento_fecha DESC
        `,
        [params.fechaInicio, params.fechaFin],
      );

      if (!result || result.length === 0) {
        return [];
      }

      return result;
    } catch (error) {
      logger.error("EstadoCorreoPostgreSQL.getByFechaRango:", error);
      throw error;
    }
  }

  /**
   * Obtiene estados por ubicación
   */
  async getByUbicacion(
    { ubicacion }: { ubicacion: string },
  ): Promise<EstadoCorreo[]> {
    try {
      logger.debug(`getByUbicacion: ${ubicacion}`);

      const result = await this.safeQuery<EstadoCorreo[]>(
        `
        SELECT ec.*
        FROM estado_correo ec
        INNER JOIN (
          SELECT
            sap_id,
            MAX(estado_correo_id) AS ultimo_id,
            MAX(ultimo_evento_fecha) AS ultima_fecha
          FROM estado_correo
          GROUP BY sap_id
        ) ult
          ON ec.sap_id = ult.sap_id
          AND ec.estado_correo_id = ult.ultimo_id
          AND ec.ultimo_evento_fecha = ult.ultima_fecha
        WHERE ec.ubicacion_actual ILIKE $1
        ORDER BY ec.ultimo_evento_fecha DESC;
        `,
        [`%${ubicacion}%`],
      );

      if (!result || result.length === 0) {
        return [];
      }

      return result;
    } catch (error) {
      logger.error("EstadoCorreoPostgreSQL.getByUbicacion:", error);
      throw error;
    }
  }

  /**
   * Marca un correo como entregado
   */
  async marcarComoEntregado(
    { id }: { id: string },
  ): Promise<EstadoCorreo | undefined> {
    try {
      logger.info(`Marcando como entregado: ${id}`);

      return await this.update({
        id,
        input: {
          entregado_ok: 1,
          estado_guia: "ENTREGADO",
          ultimo_evento_fecha: new Date(),
        },
      });
    } catch (error) {
      logger.error("EstadoCorreoPostgreSQL.marcarComoEntregado:", error);
      throw error;
    }
  }

  /**
   * Actualiza ubicación actual
   */
  async actualizarUbicacion(params: {
    id: string;
    ubicacion: string;
  }): Promise<EstadoCorreo | undefined> {
    try {
      logger.info(
        `Actualizando ubicación: ${params.id} -> ${params.ubicacion}`,
      );

      return await this.update({
        id: params.id,
        input: {
          ubicacion_actual: params.ubicacion,
          ultimo_evento_fecha: new Date(),
        },
      });
    } catch (error) {
      logger.error("EstadoCorreoPostgreSQL.actualizarUbicacion:", error);
      throw error;
    }
  }
}