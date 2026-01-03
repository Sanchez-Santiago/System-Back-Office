// ============================================
// BackEnd/src/model/correoMySQL.ts
// ============================================
import client from "../database/MySQL.ts";
import { CorreoModelDB } from "../interface/correo.ts";
import { Correo, CorreoCreate, CorreoUpdate } from "../schemas/correo/Correo.ts";
import { Client } from "mysql";

/**
 * Modelo de Correo para MySQL
 * Gestiona todas las operaciones CRUD para correos/envíos
 */
export class CorreoMySQL implements CorreoModelDB {
  connection: Client;

  constructor(connection: Client) {
    this.connection = connection;
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
        query += ` AND destinatario LIKE ?`;
        queryParams.push(`%${params.name}%`);
      }

      // Ordenar por fecha de creación descendente
      query += ` ORDER BY fecha_creacion DESC`;

      // Paginación
      query += ` LIMIT ? OFFSET ?`;
      queryParams.push(limit, offset);

      console.log("[INFO] getAll correos - Query:", query);

      const result = await this.connection.execute(query, queryParams);

      if (!result || !result.rows || result.rows.length === 0) {
        return undefined;
      }

      return result.rows as Correo[];
    } catch (error) {
      console.error("[ERROR] CorreoMySQL.getAll:", error);
      throw error;
    }
  }

  // ======================================================
  // OBTENER CORREO POR ID (SAP)
  // ======================================================
  async getById({ id }: { id: string }): Promise<Correo | undefined> {
    try {
      console.log(`[INFO] getById correo: ${id}`);

      const result = await this.connection.execute(
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
        WHERE sap_id = ?
        `,
        [id],
      );

      if (!result || !result.rows || result.rows.length === 0) {
        return undefined;
      }

      return result.rows[0] as Correo;
    } catch (error) {
      console.error("[ERROR] CorreoMySQL.getById:", error);
      throw error;
    }
  }

  // ======================================================
  // OBTENER CORREO POR SAP
  // ======================================================
  async getBySAP({ sap }: { sap: string }): Promise<Correo | undefined> {
    try {
      console.log(`[INFO] getBySAP: ${sap}`);

      const result = await this.connection.execute(
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
        WHERE sap_id = ?
        `,
        [sap],
      );

      if (!result || !result.rows || result.rows.length === 0) {
        return undefined;
      }

      return result.rows[0] as Correo;
    } catch (error) {
      console.error("[ERROR] CorreoMySQL.getBySAP:", error);
      throw error;
    }
  }

  // ======================================================
  // CREAR NUEVO CORREO
  // ======================================================
  async add(params: { input: CorreoCreate }): Promise<Correo> {
    try {
      const { input } = params;

      console.log(`[INFO] Creando correo con SAP: ${input.sap_id}`);

      await this.connection.execute("START TRANSACTION");

      await this.connection.execute(
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
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
          input.fecha_creacion,
          input.fecha_limite,
        ],
      );

      console.log(`[INFO] Insertando estado inicial...`);

      await this.connection.execute(
        `
        INSERT INTO estado_correo (
          sap_id,
          entregado_ok,
          estado_guia,
          ultimo_evento_fecha,
          ubicacion_actual,
          primera_visita,
          fecha_primer_visita
        ) VALUES (?, 0, 'INICIAL', NOW(), 'PENDIENTE', NULL, NULL)
        `,
        [input.sap_id],
      );

      await this.connection.execute("COMMIT");

      console.log(`[INFO] ✅ Correo y estado creados correctamente`);

      const correo = await this.getById({ id: input.sap_id });

      if (!correo) throw new Error("Error al recuperar el correo creado");

      return correo;

    } catch (error) {
      console.error("[ERROR] CorreoMySQL.add:", error);

      try {
        await this.connection.execute("ROLLBACK");
      } catch {
        console.error("❗ Error haciendo rollback");
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

      console.log(`[INFO] Actualizando correo: ${id}`);

      // Construir query dinámica
      const fields: string[] = [];
      const values: (string | number | Date | null)[] = [];

      if (input.telefono_contacto !== undefined) {
        fields.push("telefono_contacto = ?");
        values.push(input.telefono_contacto);
      }

      if (input.telefono_alternativo !== undefined) {
        fields.push("telefono_alternativo = ?");
        values.push(input.telefono_alternativo);
      }

      if (input.destinatario !== undefined) {
        fields.push("destinatario = ?");
        values.push(input.destinatario);
      }

      if (input.persona_autorizada !== undefined) {
        fields.push("persona_autorizada = ?");
        values.push(input.persona_autorizada);
      }

      if (input.direccion !== undefined) {
        fields.push("direccion = ?");
        values.push(input.direccion);
      }

      if (input.numero_casa !== undefined) {
        fields.push("numero_casa = ?");
        values.push(input.numero_casa);
      }

      if (input.entre_calles !== undefined) {
        fields.push("entre_calles = ?");
        values.push(input.entre_calles);
      }

      if (input.barrio !== undefined) {
        fields.push("barrio = ?");
        values.push(input.barrio);
      }

      if (input.localidad !== undefined) {
        fields.push("localidad = ?");
        values.push(input.localidad);
      }

      if (input.departamento !== undefined) {
        fields.push("departamento = ?");
        values.push(input.departamento);
      }

      if (input.codigo_postal !== undefined) {
        fields.push("codigo_postal = ?");
        values.push(input.codigo_postal);
      }

      if (input.fecha_limite !== undefined) {
        fields.push("fecha_limite = ?");
        values.push(input.fecha_limite);
      }

      if (fields.length === 0) {
        throw new Error("No hay campos para actualizar");
      }

      // Agregar ID al final
      values.push(id);

      // Ejecutar actualización
      const result = await this.connection.execute(
        `UPDATE correo SET ${fields.join(", ")} WHERE sap_id = ?`,
        values,
      );

      console.log(
        `[INFO] ✅ Correo actualizado - Affected rows: ${
          result.affectedRows || 0
        }`,
      );

      // Retornar correo actualizado
      return await this.getById({ id });
    } catch (error) {
      console.error("[ERROR] CorreoMySQL.update:", error);
      throw error;
    }
  }

  // ======================================================
  // ELIMINAR CORREO
  // ======================================================
  async delete(params: { id: string }): Promise<boolean> {
    try {
      const { id } = params;

      console.log(`[INFO] Eliminando correo: ${id}`);

      // Verificar que existe
      const correo = await this.getById({ id });
      if (!correo) {
        console.log(`[WARN] Correo ${id} no encontrado`);
        return false;
      }

      // Eliminar correo
      const result = await this.connection.execute(
        `DELETE FROM correo WHERE sap_id = ?`,
        [id],
      );

      const success = result.affectedRows !== undefined &&
        result.affectedRows > 0;

      if (success) {
        console.log(`[INFO] ✅ Correo eliminado exitosamente: ${id}`);
      }

      return success;
    } catch (error) {
      console.error("[ERROR] CorreoMySQL.delete:", error);
      throw error;
    }
  }

  // ======================================================
  // MÉTODOS ADICIONALES ÚTILES
  // ======================================================

  /**
   * Obtiene correos por localidad
   */
  async getByLocalidad({ localidad }: { localidad: string }): Promise<Correo[]> {
    try {
      console.log(`[INFO] getByLocalidad: ${localidad}`);

      const result = await this.connection.execute(
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
        WHERE localidad LIKE ?
        ORDER BY fecha_creacion DESC
        `,
        [`%${localidad}%`],
      );

      if (!result || !result.rows || result.rows.length === 0) {
        return [];
      }

      return result.rows as Correo[];
    } catch (error) {
      console.error("[ERROR] CorreoMySQL.getByLocalidad:", error);
      throw error;
    }
  }

  /**
   * Obtiene correos por departamento
   */
  async getByDepartamento({ departamento }: { departamento: string }): Promise<Correo[]> {
    try {
      console.log(`[INFO] getByDepartamento: ${departamento}`);

      const result = await this.connection.execute(
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
        WHERE departamento LIKE ?
        ORDER BY fecha_creacion DESC
        `,
        [`%${departamento}%`],
      );

      if (!result || !result.rows || result.rows.length === 0) {
        return [];
      }

      return result.rows as Correo[];
    } catch (error) {
      console.error("[ERROR] CorreoMySQL.getByDepartamento:", error);
      throw error;
    }
  }

  /**
   * Obtiene correos próximos a vencer (fecha límite cercana)
   */
  async getProximosAVencer({ dias = 3 }: { dias?: number }): Promise<Correo[]> {
    try {
      console.log(`[INFO] getProximosAVencer: ${dias} días`);

      const result = await this.connection.execute(
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
        WHERE fecha_limite BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)
        ORDER BY fecha_limite ASC
        `,
        [dias],
      );

      if (!result || !result.rows || result.rows.length === 0) {
        return [];
      }

      return result.rows as Correo[];
    } catch (error) {
      console.error("[ERROR] CorreoMySQL.getProximosAVencer:", error);
      throw error;
    }
  }

  /**
   * Obtiene correos vencidos
   */
  async getVencidos(): Promise<Correo[]> {
    try {
      console.log("[INFO] getVencidos");

      const result = await this.connection.execute(
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
        WHERE fecha_limite < CURDATE()
        ORDER BY fecha_limite ASC
        `,
      );

      if (!result || !result.rows || result.rows.length === 0) {
        return [];
      }

      return result.rows as Correo[];
    } catch (error) {
      console.error("[ERROR] CorreoMySQL.getVencidos:", error);
      throw error;
    }
  }
}
