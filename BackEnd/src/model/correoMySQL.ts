// model/CorreoModelMySQL.ts
import {
  Correo,
  CorreoCreate,
  CorreoUpdate,
} from "../schemas/correo/Correo.ts";
import client from "../database/MySQL.ts";
import { CorreoModelDB } from "../interface/correo.ts";
import { Client } from "mysql";

/**
 * Modelo de Correo para MySQL
 *
 * Implementa todas las operaciones CRUD para la tabla `correo`.
 * Gestiona el envío y tracking de correos electrónicos.
 *
 * @class CorreoModelMySQL
 * @implements {CorreoModelDB}
 */
export class CorreoModelMySQL implements CorreoModelDB {
  connection: Client;

  /**
   * Constructor del modelo
   * @param {any} connection - Conexión a la base de datos MySQL
   */
  constructor(connection: Client) {
    this.connection = connection;
  }

  /**
   * Obtiene todos los correos con paginación y filtros
   *
   * @param {Object} params - Parámetros de búsqueda
   * @param {number} [params.page=1] - Número de página
   * @param {number} [params.limit=10] - Cantidad de resultados por página
   * @param {string} [params.name] - Filtro por nombre (búsqueda parcial)
   * @param {string} [params.email] - Filtro por email (búsqueda parcial)
   * @returns {Promise<Correo[] | undefined>} Array de correos o undefined
   */
  async getAll(params: {
    page?: number;
    limit?: number;
  }): Promise<Correo[] | undefined> {
    try {
      const { page = 1, limit = 10 } = params;
      const offset = (page - 1) * limit;

      let query = `
        SELECT
        sap,
        referencia,
        telefono_contacto,
        telefono_alternativo,
        destinatario,
        persona_autorizada,
        direccion,
        localidad,
        departamento,
        estado_correo,
        fecha_entrega,
        codigo_postal,
        entrega_ok,
        fecha_creacion,
        fecha_limite,
        numero_casa,
        estado_descripcion,
        FROM correo
        WHERE 1=1
      `;

      const queryParams: (string | number)[] = [];

      // Ordenar por fecha de creación descendente
      query += ` ORDER BY creado_en DESC`;

      // Paginación
      query += ` LIMIT ? OFFSET ?`;
      queryParams.push(limit, offset);

      console.log("[INFO] getAll correos - Query:", query);
      console.log("[INFO] Params:", queryParams);

      // Ejecutar query
      const result = await this.connection.execute(query, queryParams);

      if (!result || !result.rows || result.rows.length === 0) {
        return undefined;
      }

      return result.rows as Correo[];
    } catch (error) {
      console.error("[ERROR] CorreoModelMySQL.getAll:", error);
      throw error;
    }
  }

  /**
   * Obtiene un correo específico por su ID
   *
   * @param {Object} params - Parámetros de búsqueda
   * @param {string} params.id - UUID del correo
   * @returns {Promise<Correo | undefined>} Correo encontrado o undefined
   */
  async getById({ id }: { id: string }): Promise<Correo | undefined> {
    try {
      console.log(`[INFO] getById correo: ${id}`);

      const result = await this.connection.execute(
        `
        SELECT
        sap,
        referencia,
        telefono_contacto,
        telefono_alternativo,
        destinatario,
        persona_autorizada,
        direccion,
        localidad,
        departamento,
        estado_correo,
        fecha_entrega,
        codigo_postal,
        entrega_ok,
        fecha_creacion,
        fecha_limite,
        numero_casa,
        estado_descripcion,
        FROM correo
        WHERE sap = ?
        `,
        [id],
      );

      if (!result || !result.rows || result.rows.length === 0) {
        return undefined;
      }

      return result.rows[0] as Correo;
    } catch (error) {
      console.error("[ERROR] CorreoModelMySQL.getById:", error);
      throw error;
    }
  }

  /**
   * Obtiene correos por código SAP
   *
   * @param {Object} params - Parámetros de búsqueda
   * @param {string} params.sap - Código SAP
   * @returns {Promise<Correo | undefined>} Correo encontrado o undefined
   */
  async getBySAP({ sap }: { sap: string }): Promise<Correo | undefined> {
    try {
      console.log(`[INFO] getBySAP: ${sap}`);

      const result = await this.connection.execute(
        `
        SELECT
        sap,
        referencia,
        telefono_contacto,
        telefono_alternativo,
        destinatario,
        persona_autorizada,
        direccion,
        localidad,
        departamento,
        estado_correo,
        fecha_entrega,
        codigo_postal,
        entrega_ok,
        fecha_creacion,
        fecha_limite,
        numero_casa,
        estado_descripcion,
        FROM correo
        WHERE sap = ?
        ORDER BY creado_en DESC
        `,
        [sap],
      );

      if (!result || !result.rows || result.rows.length === 0) {
        return undefined;
      }

      return result.rows[0] as Correo;
    } catch (error) {
      console.error("[ERROR] CorreoModelMySQL.getBySAP:", error);
      throw error;
    }
  }

  /**
   * Crea un nuevo correo
   *
   * @param {Object} params - Parámetros de creación
   * @param {CorreoCreate} params.input - Datos del correo a crear
   * @returns {Promise<Correo>} Correo creado
   */
  async add(params: { input: CorreoCreate }): Promise<Correo> {
    try {
      const { input } = params;

      // Generar UUID para el correo
      const correoId = crypto.randomUUID();
      const now = new Date();

      console.log(`[INFO] Creando correo con ID: ${correoId}`);

      // Insertar correo
      await this.connection.execute(
        `
        INSERT INTO correo (
          id,
          sap,
          email,
          nombre,
          asunto,
          cuerpo,
          enviado,
          fecha_envio,
          creado_en,
          actualizado_en
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          correoId,
          input.sap,
          input.email.toLowerCase(),
          input.nombre || null,
          input.asunto || null,
          input.cuerpo || null,
          input.enviado || false,
          input.fecha_envio || null,
          now,
          now,
        ],
      );

      console.log(`[INFO] ✅ Correo creado exitosamente: ${correoId}`);

      // Obtener el correo creado
      const correo = await this.getById({ id: correoId });

      if (!correo) {
        throw new Error("Error al recuperar el correo creado");
      }

      return correo;
    } catch (error) {
      console.error("[ERROR] CorreoModelMySQL.add:", error);
      throw error;
    }
  }

  /**
   * Actualiza un correo existente
   *
   * @param {Object} params - Parámetros de actualización
   * @param {string} params.id - UUID del correo a actualizar
   * @param {Partial<CorreoUpdate>} params.input - Datos a actualizar (parcial)
   * @returns {Promise<Correo | undefined>} Correo actualizado o undefined
   */
  async update(params: {
    id: string;
    input: Partial<CorreoUpdate>;
  }): Promise<Correo | undefined> {
    try {
      const { id, input } = params;

      console.log(`[INFO] Actualizando correo: ${id}`);

      // Construir query dinámica
      const fields: string[] = [];
      const values: (string | number | boolean | Date | null)[] = [];

      if (input.sap !== undefined) {
        fields.push("sap = ?");
        values.push(input.sap);
      }

      if (input.email !== undefined) {
        fields.push("email = ?");
        values.push(input.email.toLowerCase());
      }

      if (input.nombre !== undefined) {
        fields.push("nombre = ?");
        values.push(input.nombre);
      }

      if (input.asunto !== undefined) {
        fields.push("asunto = ?");
        values.push(input.asunto);
      }

      if (input.cuerpo !== undefined) {
        fields.push("cuerpo = ?");
        values.push(input.cuerpo);
      }

      if (input.enviado !== undefined) {
        fields.push("enviado = ?");
        values.push(input.enviado);
      }

      if (input.fecha_envio !== undefined) {
        fields.push("fecha_envio = ?");
        values.push(input.fecha_envio);
      }

      // Siempre actualizar actualizado_en
      fields.push("actualizado_en = ?");
      values.push(new Date());

      if (fields.length === 0) {
        throw new Error("No hay campos para actualizar");
      }

      // Agregar ID al final
      values.push(id);

      // Ejecutar actualización
      const result = await this.connection.execute(
        `UPDATE correo SET ${fields.join(", ")} WHERE id = ?`,
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
      console.error("[ERROR] CorreoModelMySQL.update:", error);
      throw error;
    }
  }

  /**
   * Elimina un correo de forma permanente
   *
   * @param {Object} params - Parámetros de eliminación
   * @param {string} params.id - UUID del correo a eliminar
   * @returns {Promise<boolean>} true si se eliminó, false si no existía
   */
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
        `DELETE FROM correo WHERE id = ?`,
        [id],
      );

      const success = result.affectedRows !== undefined &&
        result.affectedRows > 0;

      if (success) {
        console.log(`[INFO] ✅ Correo eliminado exitosamente: ${id}`);
      }

      return success;
    } catch (error) {
      console.error("[ERROR] CorreoModelMySQL.delete:", error);
      throw error;
    }
  }

  /**
   * Marca un correo como enviado
   *
   * @param {Object} params - Parámetros
   * @param {string} params.id - UUID del correo
   * @returns {Promise<Correo | undefined>} Correo actualizado
   */
  async marcarComoEnviado({ id }: { id: string }): Promise<Correo | undefined> {
    return await this.update({
      id,
      input: {
        enviado: true,
        fecha_envio: new Date(),
      },
    });
  }

  /**
   * Obtiene correos pendientes de envío
   *
   * @param {number} [limit=10] - Cantidad máxima de correos a obtener
   * @returns {Promise<Correo[]>} Array de correos pendientes
   */
  async getPendientes(limit: number = 10): Promise<Correo[]> {
    try {
      console.log(`[INFO] Obteniendo correos pendientes (limit: ${limit})`);

      const result = await this.connection.execute(
        `
        SELECT
          id,
          sap,
          email,
          nombre,
          asunto,
          cuerpo,
          enviado,
          fecha_envio,
          creado_en,
          actualizado_en
        FROM correo
        WHERE enviado = FALSE
        ORDER BY creado_en ASC
        LIMIT ?
        `,
        [limit],
      );

      if (!result || !result.rows || result.rows.length === 0) {
        return [];
      }

      return result.rows as Correo[];
    } catch (error) {
      console.error("[ERROR] CorreoModelMySQL.getPendientes:", error);
      throw error;
    }
  }
}
