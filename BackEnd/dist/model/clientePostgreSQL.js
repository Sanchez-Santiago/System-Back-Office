import { logger } from "../Utils/logger";
export class ClientePostgreSQL {
    connection;
    constructor(connection) {
        this.connection = connection;
    }
    // ======================
    // MÉTODOS DE LOGGING
    // ======================
    logSuccess(message, details) {
        const isDev = process.env.MODO === "development";
        if (isDev) {
            logger.info(`${message} ${details ? JSON.stringify(details) : ""}`);
        }
        else {
            logger.info(message);
        }
    }
    logError(message, error) {
        const isDev = process.env.MODO === "development";
        if (isDev) {
            logger.error(`${message} ${error ? JSON.stringify(error) : ""}`);
        }
        else {
            logger.error(message);
        }
    }
    // ======================
    // GET ALL
    // ======================
    async getAll(params = {}) {
        const { page = 1, limit = 10 } = params;
        if (page < 1 || limit < 1) {
            throw new Error("page y limit deben ser mayores a 0");
        }
        const offset = (page - 1) * limit;
        try {
            const client = this.connection.getClient();
            const result = await client.queryObject(`SELECT persona_id FROM cliente LIMIT $1 OFFSET $2`, [limit, offset]);
            return result.rows || [];
        }
        catch (error) {
            this.logError("Error al obtener clientes", error);
            throw error;
        }
    }
    // ======================
    // GET BY ID
    // ======================
    async getById({ id }) {
        return await this.getByPersonaId({ personaId: id });
    }
    // ======================
    // GET BY PERSONA ID
    // ======================
    async getByPersonaId({ personaId }) {
        if (!personaId) {
            throw new Error("personaId es requerido");
        }
        try {
            const client = this.connection.getClient();
            const result = await client.queryObject(`SELECT persona_id FROM cliente WHERE persona_id = $1`, [personaId]);
            return result.rows.length > 0 ? result.rows[0] : undefined;
        }
        catch (error) {
            this.logError("Error al obtener cliente por persona_id", error);
            throw error;
        }
    }
    // ======================
    // GET WITH PERSONA DATA
    // ======================
    async getWithPersonaData({ personaId }) {
        if (!personaId) {
            throw new Error("personaId es requerido");
        }
        try {
            const client = this.connection.getClient();
            const result = await client.queryObject(`SELECT
          c.persona_id,
          p.nombre,
          p.apellido,
          p.email,
          p.documento,
          p.tipo_documento,
          p.telefono,
          p.fecha_nacimiento,
          p.nacionalidad,
          p.genero
         FROM cliente c
         INNER JOIN persona p ON c.persona_id = p.persona_id
         WHERE c.persona_id = $1`, [personaId]);
            return result.rows.length > 0 ? result.rows[0] : undefined;
        }
        catch (error) {
            this.logError("Error al obtener cliente con datos de persona", error);
            throw error;
        }
    }
    // ======================
    // GET ALL WITH PERSONA DATA
    // ======================
    async getAllWithPersonaData(params = {}) {
        const { page = 1, limit = 10 } = params;
        if (page < 1 || limit < 1) {
            throw new Error("page y limit deben ser mayores a 0");
        }
        const offset = (page - 1) * limit;
        try {
            const client = this.connection.getClient();
            const result = await client.queryObject(`SELECT
          c.persona_id,
          p.nombre,
          p.apellido,
          p.email,
          p.documento,
          p.tipo_documento,
          p.telefono,
          p.fecha_nacimiento,
          p.nacionalidad,
          p.genero
         FROM cliente c
         INNER JOIN persona p ON c.persona_id = p.persona_id
         LIMIT $1 OFFSET $2`, [limit, offset]);
            return result.rows || [];
        }
        catch (error) {
            this.logError("Error al obtener clientes con datos de persona", error);
            throw error;
        }
    }
    // ======================
    // GET BY DOCUMENTO
    // ======================
    async getByDocumento({ tipo_documento, documento }) {
        if (!tipo_documento || !documento) {
            throw new Error("tipo_documento y documento son requeridos");
        }
        try {
            const client = this.connection.getClient();
            const result = await client.queryObject(`SELECT
          c.persona_id,
          p.nombre,
          p.apellido,
          p.email,
          p.documento,
          p.tipo_documento,
          p.telefono,
          p.fecha_nacimiento,
          p.nacionalidad,
          p.genero
         FROM cliente c
         INNER JOIN persona p ON c.persona_id = p.persona_id
         WHERE p.tipo_documento = $1 AND p.documento = $2`, [tipo_documento, documento]);
            return result.rows.length > 0 ? result.rows[0] : undefined;
        }
        catch (error) {
            this.logError("Error al obtener cliente por documento", error);
            throw error;
        }
    }
    // ======================
    // ADD
    // ======================
    async add({ input }) {
        const client = this.connection.getClient();
        try {
            this.logSuccess("Iniciando creación de cliente", {
                email: input.email,
                documento: input.documento,
            });
            await client.queryObject("BEGIN");
            try {
                // Generar UUID para persona_id
                const persona_id = crypto.randomUUID();
                const now = new Date();
                // 1. Crear la persona
                await client.queryObject(`INSERT INTO persona (
            persona_id, nombre, apellido, fecha_nacimiento, documento,
            email, telefono, telefono_alternativo, tipo_documento, nacionalidad, genero, creado_en
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`, [
                    persona_id,
                    input.nombre,
                    input.apellido,
                    input.fecha_nacimiento,
                    input.documento,
                    input.email,
                    input.telefono || null,
                    input.telefono_alternativo || null,
                    input.tipo_documento,
                    input.nacionalidad,
                    input.genero,
                    now,
                ]);
                this.logSuccess("Persona creada exitosamente", { persona_id });
                // 2. Crear el cliente
                await client.queryObject(`INSERT INTO cliente (persona_id) VALUES ($1)`, [persona_id]);
                this.logSuccess("Cliente creado exitosamente", { persona_id });
                await client.queryObject("COMMIT");
                return { persona_id };
            }
            catch (error) {
                await client.queryObject("ROLLBACK");
                this.logError("Error durante transacción de creación, haciendo rollback", error);
                throw error;
            }
        }
        catch (error) {
            this.logError("Error al crear cliente", error);
            throw error;
        }
    }
    // ======================
    // UPDATE
    // ======================
    async update({ id, input }) {
        if (!id) {
            throw new Error("ID es requerido para actualizar cliente");
        }
        const client = this.connection.getClient();
        try {
            this.logSuccess("Iniciando actualización de cliente", { id, input });
            // Verificar que el cliente existe
            const existingCliente = await this.getById({ id });
            if (!existingCliente) {
                this.logError("Cliente no encontrado para actualizar", { id });
                return undefined;
            }
            // Construir query dinámico solo con campos definidos
            const updateFields = [];
            const values = [];
            let paramIndex = 1;
            if (input.nombre !== undefined) {
                updateFields.push(`nombre = $${paramIndex++}`);
                values.push(input.nombre);
            }
            if (input.apellido !== undefined) {
                updateFields.push(`apellido = $${paramIndex++}`);
                values.push(input.apellido);
            }
            if (input.fecha_nacimiento !== undefined) {
                updateFields.push(`fecha_nacimiento = $${paramIndex++}`);
                values.push(input.fecha_nacimiento);
            }
            if (input.documento !== undefined) {
                updateFields.push(`documento = $${paramIndex++}`);
                values.push(input.documento);
            }
            if (input.email !== undefined) {
                updateFields.push(`email = $${paramIndex++}`);
                values.push(input.email);
            }
            if (input.telefono !== undefined) {
                updateFields.push(`telefono = $${paramIndex++}`);
                values.push(input.telefono);
            }
            if (input.tipo_documento !== undefined) {
                updateFields.push(`tipo_documento = $${paramIndex++}`);
                values.push(input.tipo_documento);
            }
            if (input.nacionalidad !== undefined) {
                updateFields.push(`nacionalidad = $${paramIndex++}`);
                values.push(input.nacionalidad);
            }
            if (input.genero !== undefined) {
                updateFields.push(`genero = $${paramIndex++}`);
                values.push(input.genero);
            }
            // Solo actualizar si hay campos para actualizar
            if (updateFields.length > 0) {
                values.push(id);
                await client.queryObject(`UPDATE persona
           SET ${updateFields.join(", ")}
           WHERE persona_id = $${paramIndex}`, values);
                this.logSuccess("Cliente actualizado exitosamente", { id });
            }
            else {
                this.logSuccess("No hay campos para actualizar", { id });
            }
            // Devolver el cliente actualizado
            return this.getById({ id });
        }
        catch (error) {
            this.logError("Error al actualizar cliente", error);
            throw error;
        }
    }
    // ======================
    // DELETE
    // ======================
    async delete({ id }) {
        if (!id) {
            throw new Error("ID es requerido para eliminar cliente");
        }
        const client = this.connection.getClient();
        try {
            this.logSuccess("Iniciando eliminación de cliente", { id });
            // Verificar que el cliente existe
            const existingCliente = await this.getById({ id });
            if (!existingCliente) {
                this.logError("Cliente no encontrado para eliminar", { id });
                return false;
            }
            // Usar transacción para eliminar
            await client.queryObject("BEGIN");
            try {
                // 1. Eliminar el cliente
                const clienteResult = await client.queryObject(`DELETE FROM cliente WHERE persona_id = $1 RETURNING persona_id`, [id]);
                // 2. Eliminar la persona
                if (clienteResult.rows.length > 0) {
                    await client.queryObject(`DELETE FROM persona WHERE persona_id = $1`, [id]);
                }
                await client.queryObject("COMMIT");
                this.logSuccess("Cliente eliminado exitosamente", { id });
                return true;
            }
            catch (error) {
                await client.queryObject("ROLLBACK");
                this.logError("Error durante transacción de eliminación, haciendo rollback", error);
                throw error;
            }
        }
        catch (error) {
            this.logError("Error al eliminar cliente", error);
            throw error;
        }
    }
}
//# sourceMappingURL=clientePostgreSQL.js.map