// ============================================
// BackEnd/src/model/correoPostgreSQL.ts
// ============================================
import { CorreoModelDB } from "../interface/correo.ts";
import {
  Correo,
  CorreoCreate,
  CorreoUpdate,
} from "../schemas/correo/Correo.ts";
import { ResilientPostgresConnection } from "../database/PostgreSQL.ts";
import { logger } from "../Utils/logger.ts";
import { ServiceDegradedError } from "../types/errors.ts";

/**
 * Modelo de Correo para PostgreSQL con manejo resiliente
 * Gestiona todas las operaciones CRUD para correos/envíos
 */
export class CorreoPostgreSQL implements CorreoModelDB {
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
      if (error instanceof ServiceDegradedError) {
        throw error;
      }
      logger.error("CorreoPostgreSQL.safeQuery:", error);
      throw error;
    }
  }

  // ======================================================
  // OBTENER TODOS LOS CORREOS CON PAGINACIÓN
  // ======================================================
  async getAll(params: {
    page?: number;
    limit?: number;
    name?: string;
    email?: string;
  }): Promise<Correo[] | undefined> {
    try {
      const { page = 1, limit = 10 } = params;
      const offset = (page - 1) * limit;

      let query = `
        SELECT
          sap_id,
          telefono_contacto,
          telefono_alternativo,
          destinatario,
          persona_autorizada,
          direccion,
          numero_casa,
          entre_calles,
          barrio,
          localidad,
          departamento,
          codigo_postal,
          fecha_creacion,
          fecha_limite
        FROM correo
        WHERE 1=1
      `;

      const queryParams: (string | number)[] = [];

      // Filtro por nombre de destinatario
      if (params.name) {
        query += ` AND destinatario ILIKE $${queryParams.length + 1}`;
        queryParams.push(`%${params.name}%`);
      }

      // Ordenar por fecha de creación descendente
      query += ` ORDER BY fecha_creacion DESC`;

      // Paginación
      query += ` LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
      queryParams.push(limit, offset);

      logger.debug("getAll correos - Query:", query);

      const result = await this.safeQuery<Correo[]>(query, queryParams);

      if (!result || result.length === 0) {
        return undefined;
      }

      return result;
    } catch (error) {
      logger.error("CorreoPostgreSQL.getAll:", error);
      throw error;
    }
  }

  // ======================================================
  // OBTENER CORREO POR ID (SAP)
  // ======================================================
  async getById({ id }: { id: string }): Promise<Correo | undefined> {
    try {
      logger.debug(`getById correo: ${id}`);

      const result = await this.safeQuery<Correo[]>(
        `
        SELECT
          sap_id,
          telefono_contacto,
          telefono_alternativo,
          destinatario,
          persona_autorizada,
          direccion,
          numero_casa,
          entre_calles,
          barrio,
          localidad,
          departamento,
          codigo_postal,
          fecha_creacion,
          fecha_limite
        FROM correo
        WHERE sap_id = $1
        `,
        [id],
      );

      if (!result || result.length === 0) {
        return undefined;
      }

      return result[0];
    } catch (error) {
      logger.error("CorreoPostgreSQL.getById:", error);
      throw error;
    }
  }

  // ======================================================
  // OBTENER CORREO POR SAP
  // ======================================================
  async getBySAP({ sap }: { sap: string }): Promise<Correo | undefined> {
    try {
      logger.debug(`getBySAP: ${sap}`);

      const result = await this.safeQuery<Correo[]>(
        `
        SELECT
          sap_id,
          telefono_contacto,
          telefono_alternativo,
          destinatario,
          persona_autorizada,
          direccion,
          numero_casa,
          entre_calles,
          barrio,
          localidad,
          departamento,
          codigo_postal,
          fecha_creacion,
          fecha_limite
        FROM correo
        WHERE sap_id = $1
        `,
        [sap],
      );

      if (!result || result.length === 0) {
        return undefined;
      }

      return result[0];
    } catch (error) {
      logger.error("CorreoPostgreSQL.getBySAP:", error);
      throw error;
    }
  }

  // ======================================================
  // CREAR NUEVO CORREO
  // ======================================================
  async add(params: { input: CorreoCreate }): Promise<Correo> {
    try {
      const { input } = params;

      logger.info(`Creando correo con SAP: ${input.sap_id}`);

      await this.safeQuery("BEGIN");

      const fecha_limite = new Date();
      fecha_limite.setDate(fecha_limite.getDate() + 7);
      
      await this.safeQuery(
        `
        INSERT INTO correo (
          sap_id,
          telefono_contacto,
          telefono_alternativo,
          destinatario,
          persona_autorizada,
          direccion,
          numero_casa,
          entre_calles,
          barrio,
          localidad,
          departamento,
          codigo_postal,
          fecha_creacion,
          fecha_limite
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        `,
        [
          input.sap_id,
          input.telefono_contacto,
          input.telefono_alternativo || null,
          input.destinatario,
          input.persona_autorizada || null,
          input.direccion,
          input.numero_casa,
          input.entre_calles || null,
          input.barrio || null,
          input.localidad,
          input.departamento,
          input.codigo_postal,
          new Date(),
          fecha_limite,
        ],
      );

      logger.debug(`Insertando estado inicial...`);

      await this.safeQuery(
        `
        INSERT INTO estado_correo (
          sap_id,
          entregado_ok,
          estado_guia,
          ultimo_evento_fecha,
          ubicacion_actual,
          primera_visita,
          fecha_primer_visita
        ) VALUES ($1, 0, 'INICIAL', NOW(), 'PENDIENTE', NULL, NULL)
        `,
        [input.sap_id],
      );

      await this.safeQuery("COMMIT");

      logger.info(`Correo y estado creados correctamente`);

      const correo = await this.getById({ id: input.sap_id });

      if (!correo) throw new Error("Error al recuperar el correo creado");

      return correo;
    } catch (error) {
      logger.error("CorreoPostgreSQL.add:", error);

      try {
        await this.safeQuery("ROLLBACK");
      } catch {
        logger.error("Error haciendo rollback");
      }

      throw error;
    }
  }

  // ======================================================
  // ACTUALIZAR CORREO
  // ======================================================
  async update(params: {
    id: string;
    input: Partial<CorreoUpdate>;
  }): Promise<Correo | undefined> {
    try {
      const { id, input } = params;

      logger.info(`Actualizando correo: ${id}`);

      // Construir query dinámica
      const fields: string[] = [];
      const values: (string | number | Date | null)[] = [];
      let paramIndex = 1;

      if (input.telefono_contacto !== undefined) {
        fields.push(`telefono_contacto = $${paramIndex++}`);
        values.push(input.telefono_contacto);
      }

      if (input.telefono_alternativo !== undefined) {
        fields.push(`telefono_alternativo = $${paramIndex++}`);
        values.push(input.telefono_alternativo);
      }

      if (input.destinatario !== undefined) {
        fields.push(`destinatario = $${paramIndex++}`);
        values.push(input.destinatario);
      }

      if (input.persona_autorizada !== undefined) {
        fields.push(`persona_autorizada = $${paramIndex++}`);
        values.push(input.persona_autorizada);
      }

      if (input.direccion !== undefined) {
        fields.push(`direccion = $${paramIndex++}`);
        values.push(input.direccion);
      }

      if (input.numero_casa !== undefined) {
        fields.push(`numero_casa = $${paramIndex++}`);
        values.push(input.numero_casa);
      }

      if (input.entre_calles !== undefined) {
        fields.push(`entre_calles = $${paramIndex++}`);
        values.push(input.entre_calles);
      }

      if (input.barrio !== undefined) {
        fields.push(`barrio = $${paramIndex++}`);
        values.push(input.barrio);
      }

      if (input.localidad !== undefined) {
        fields.push(`localidad = $${paramIndex++}`);
        values.push(input.localidad);
      }

      if (input.departamento !== undefined) {
        fields.push(`departamento = $${paramIndex++}`);
        values.push(input.departamento);
      }

      if (input.codigo_postal !== undefined) {
        fields.push(`codigo_postal = $${paramIndex++}`);
        values.push(input.codigo_postal);
      }

      if (input.fecha_limite !== undefined) {
        fields.push(`fecha_limite = $${paramIndex++}`);
        values.push(input.fecha_limite);
      }

      if (fields.length === 0) {
        throw new Error("No hay campos para actualizar");
      }

      // Agregar ID al final
      values.push(id);

      // Ejecutar actualización
      const result = await this.safeQuery(
        `UPDATE correo SET ${fields.join(", ")} WHERE sap_id = $${paramIndex}`,
        values,
      );

      logger.info(
        `Correo actualizado - ${result ? "Success" : "Failed"}`,
      );

      // Retornar correo actualizado
      return await this.getById({ id });
    } catch (error) {
      logger.error("CorreoPostgreSQL.update:", error);
      throw error;
    }
  }

  // ======================================================
  // ELIMINAR CORREO
  // ======================================================
  async delete(params: { id: string }): Promise<boolean> {
    try {
      const { id } = params;

      logger.info(`Eliminando correo: ${id}`);

      // Verificar que existe
      const correo = await this.getById({ id });
      if (!correo) {
        logger.warn(`Correo ${id} no encontrado`);
        return false;
      }

      // Eliminar correo
      const result = await this.safeQuery(
        `DELETE FROM correo WHERE sap_id = $1`,
        [id],
      );

      const success = Array.isArray(result) ? result.length > 0 : false;

      if (success) {
        logger.info(`Correo eliminado exitosamente: ${id}`);
      }

      return success;
    } catch (error) {
      logger.error("CorreoPostgreSQL.delete:", error);
      throw error;
    }
  }

  // ======================================================
  // MÉTODOS ADICIONALES ÚTILES
  // ======================================================

  /**
   * Obtiene correos por localidad
   */
  async getByLocalidad(
    { localidad }: { localidad: string },
  ): Promise<Correo[]> {
    try {
      logger.debug(`getByLocalidad: ${localidad}`);

      const result = await this.safeQuery<Correo[]>(
        `
        SELECT
          sap_id,
          telefono_contacto,
          telefono_alternativo,
          destinatario,
          persona_autorizada,
          direccion,
          numero_casa,
          entre_calles,
          barrio,
          localidad,
          departamento,
          codigo_postal,
          fecha_creacion,
          fecha_limite
        FROM correo
        WHERE localidad ILIKE $1
        ORDER BY fecha_creacion DESC
        `,
        [`%${localidad}%`],
      );

      if (!result || result.length === 0) {
        return [];
      }

      return result;
    } catch (error) {
      logger.error("CorreoPostgreSQL.getByLocalidad:", error);
      throw error;
    }
  }

  /**
   * Obtiene correos por departamento
   */
  async getByDepartamento(
    { departamento }: { departamento: string },
  ): Promise<Correo[]> {
    try {
      logger.debug(`getByDepartamento: ${departamento}`);

      const result = await this.safeQuery<Correo[]>(
        `
        SELECT
          sap_id,
          telefono_contacto,
          telefono_alternativo,
          destinatario,
          persona_autorizada,
          direccion,
          numero_casa,
          entre_calles,
          barrio,
          localidad,
          departamento,
          codigo_postal,
          fecha_creacion,
          fecha_limite
        FROM correo
        WHERE departamento ILIKE $1
        ORDER BY fecha_creacion DESC
        `,
        [`%${departamento}%`],
      );

      if (!result || result.length === 0) {
        return [];
      }

      return result;
    } catch (error) {
      logger.error("CorreoPostgreSQL.getByDepartamento:", error);
      throw error;
    }
  }

  /**
   * Obtiene correos próximos a vencer (fecha límite cercana)
   */
  async getProximosAVencer({ dias = 3 }: { dias?: number }): Promise<Correo[]> {
    try {
      logger.debug(`getProximosAVencer: ${dias} días`);

      const result = await this.safeQuery<Correo[]>(
        `
        SELECT
          sap_id,
          telefono_contacto,
          telefono_alternativo,
          destinatario,
          persona_autorizada,
          direccion,
          numero_casa,
          entre_calles,
          barrio,
          localidad,
          departamento,
          codigo_postal,
          fecha_creacion,
          fecha_limite
        FROM correo
        WHERE fecha_limite BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '${dias} days'
        ORDER BY fecha_limite ASC
        `,
      );

      if (!result || result.length === 0) {
        return [];
      }

      return result;
    } catch (error) {
      logger.error("CorreoPostgreSQL.getProximosAVencer:", error);
      throw error;
    }
  }

  /**
   * Obtiene correos vencidos
   */
  async getVencidos(): Promise<Correo[]> {
    try {
      logger.debug("getVencidos");

      const result = await this.safeQuery<Correo[]>(
        `
        SELECT
          sap_id,
          telefono_contacto,
          telefono_alternativo,
          destinatario,
          persona_autorizada,
          direccion,
          numero_casa,
          entre_calles,
          barrio,
          localidad,
          departamento,
          codigo_postal,
          fecha_creacion,
          fecha_limite
        FROM correo
        WHERE fecha_limite < CURRENT_DATE
        ORDER BY fecha_limite ASC
        `,
      );

      if (!result || result.length === 0) {
        return [];
      }

      return result;
    } catch (error) {
      logger.error("CorreoPostgreSQL.getVencidos:", error);
      throw error;
    }
  }
}