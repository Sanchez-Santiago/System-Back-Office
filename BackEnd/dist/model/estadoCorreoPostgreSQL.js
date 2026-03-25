// ============================================
// BackEnd/src/model/estadoCorreoPostgreSQL.ts
// MODELO COMPLETO – siguiendo CorreoPostgreSQL
// ============================================
import { logger } from "../Utils/logger";
export class EstadoCorreoPostgreSQL {
    connection;
    constructor(connection) {
        this.connection = connection;
    }
    // ======================
    // LOGGING
    // ======================
    logInfo(message, data) {
        if (process.env.MODO === "development") {
            logger.info(`${message} ${data ? JSON.stringify(data) : ""}`);
        }
        else {
            logger.info(message);
        }
    }
    logWarn(message, data) {
        if (process.env.MODO === "development") {
            logger.warn(`${message} ${data ? JSON.stringify(data) : ""}`);
        }
        else {
            logger.warn(message);
        }
    }
    logError(message, error) {
        if (process.env.MODO === "development") {
            logger.error(`${message} ${error ? JSON.stringify(error) : ""}`);
        }
        else {
            logger.error(message);
        }
    }
    // ======================
    // BASE SELECT
    // ======================
    baseSelect = `
    SELECT
      estado_correo_id,
      sap_id,
      estado,
      descripcion,
      fecha_creacion,
      usuario_id,
      ubicacion_actual
    FROM estado_correo
  `;
    // ======================================================
    // OBTENER TODOS LOS ESTADOS
    // ======================================================
    async getAll() {
        const client = this.connection.getClient();
        const result = await client.queryObject(this.baseSelect + " ORDER BY fecha_creacion DESC");
        // Convertir BigInt a número para evitar error de serialización JSON
        return (result.rows ?? []).map(row => ({
            ...row,
            estado_correo_id: Number(row.estado_correo_id),
        }));
    }
    // ======================================================
    // OBTENER ESTADO POR ID
    // ======================================================
    async getById({ id }) {
        const client = this.connection.getClient();
        const result = await client.queryObject(this.baseSelect + " WHERE estado_correo_id = $1", [id]);
        return result.rows.length > 0 ? result.rows[0] : undefined;
    }
    // ======================================================
    // OBTENER ESTADOS POR SAP
    // ======================================================
    async getBySAP({ sap }) {
        const client = this.connection.getClient();
        const result = await client.queryObject(this.baseSelect +
            " WHERE sap_id = $1 ORDER BY fecha_creacion DESC", [sap.toUpperCase()]);
        return result.rows ?? [];
    }
    // ======================================================
    // OBTENER ÚLTIMO ESTADO DE UN CORREO
    // ======================================================
    async getLastBySAP({ sap }) {
        const client = this.connection.getClient();
        const result = await client.queryObject(this.baseSelect +
            " WHERE sap_id = $1 ORDER BY fecha_creacion DESC LIMIT 1", [sap.toUpperCase()]);
        return result.rows.length > 0 ? result.rows[0] : undefined;
    }
    // ======================================================
    // OBTENER ESTADOS ENTREGADOS (estado = 'ENTREGADO')
    // ======================================================
    async getEntregados() {
        const client = this.connection.getClient();
        const result = await client.queryObject(this.baseSelect +
            " WHERE UPPER(estado) = 'ENTREGADO' ORDER BY fecha_creacion DESC");
        return result.rows ?? [];
    }
    // ======================================================
    // OBTENER ESTADOS NO ENTREGADOS (estado = 'NO ENTREGADO')
    // ======================================================
    async getNoEntregados() {
        const client = this.connection.getClient();
        const result = await client.queryObject(this.baseSelect +
            " WHERE UPPER(estado) = 'NO ENTREGADO' ORDER BY fecha_creacion DESC");
        return result.rows ?? [];
    }
    // ======================================================
    // OBTENER ESTADOS DEVUELTOS (estado = 'DEVUELTO AL CLIENTE')
    // ======================================================
    async getDevueltos() {
        const client = this.connection.getClient();
        const result = await client.queryObject(this.baseSelect +
            " WHERE UPPER(estado) = 'DEVUELTO AL CLIENTE' ORDER BY fecha_creacion DESC");
        return result.rows ?? [];
    }
    // ======================================================
    // OBTENER ESTADOS EN TRANSITO (estado = 'EN TRANSITO')
    // ======================================================
    async getEnTransito() {
        const client = this.connection.getClient();
        const result = await client.queryObject(this.baseSelect +
            " WHERE UPPER(estado) = 'EN TRANSITO' ORDER BY fecha_creacion DESC");
        return result.rows ?? [];
    }
    // ======================================================
    // OBTENER ESTADOS ASIGNADOS (estado = 'ASIGNADO')
    // ======================================================
    async getAsignados() {
        const client = this.connection.getClient();
        const result = await client.queryObject(this.baseSelect +
            " WHERE UPPER(estado) = 'ASIGNADO' ORDER BY fecha_creacion DESC");
        return result.rows ?? [];
    }
    // ======================================================
    // OBTENER ESTADOS POR ESTADO ESPECÍFICO
    // ======================================================
    async getByEstado({ estado }) {
        const client = this.connection.getClient();
        const result = await client.queryObject(this.baseSelect +
            " WHERE UPPER(estado) = $1 ORDER BY fecha_creacion DESC", [estado.toUpperCase()]);
        return result.rows ?? [];
    }
    // ======================================================
    // OBTENER ESTADOS POR RANGO DE FECHAS
    // ======================================================
    async getByFechaRango({ fechaInicio, fechaFin }) {
        const client = this.connection.getClient();
        const result = await client.queryObject(this.baseSelect +
            " WHERE fecha_creacion BETWEEN $1 AND $2 ORDER BY fecha_creacion DESC", [fechaInicio, fechaFin]);
        return result.rows ?? [];
    }
    // ======================================================
    // OBTENER ESTADOS POR UBICACIÓN
    // ======================================================
    async getByUbicacion({ ubicacion }) {
        const client = this.connection.getClient();
        const result = await client.queryObject(this.baseSelect +
            " WHERE UPPER(ubicacion_actual) LIKE $1 ORDER BY fecha_creacion DESC", [`%${ubicacion.toUpperCase()}%`]);
        return result.rows ?? [];
    }
    // ======================================================
    // CREAR NUEVO ESTADO
    // ======================================================
    async add({ input }) {
        const client = this.connection.getClient();
        const result = await client.queryObject(`
      INSERT INTO estado_correo (
        sap_id,
        estado,
        descripcion,
        fecha_creacion,
        usuario_id,
        ubicacion_actual
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `, [
            input.sap_id.toUpperCase(),
            input.estado.toUpperCase(),
            input.descripcion ?? null,
            new Date(),
            input.usuario_id ?? null,
            input.ubicacion_actual ?? null,
        ]);
        this.logInfo("Estado de correo creado", result.rows[0]);
        return result.rows[0];
    }
    // ======================================================
    // ACTUALIZAR ESTADO / DESCRIPCIÓN / UBICACIÓN
    // ======================================================
    async update({ id, input }) {
        const client = this.connection.getClient();
        const fields = [];
        const values = [];
        let index = 1;
        if (input.estado !== undefined) {
            fields.push(`estado = $${index++}`);
            values.push(input.estado.toUpperCase());
        }
        if (input.descripcion !== undefined) {
            fields.push(`descripcion = $${index++}`);
            values.push(input.descripcion);
        }
        if (input.ubicacion_actual !== undefined) {
            fields.push(`ubicacion_actual = $${index++}`);
            values.push(input.ubicacion_actual);
        }
        if (fields.length === 0) {
            this.logWarn("Update de estado sin campos", { id });
            return undefined;
        }
        values.push(id);
        const result = await client.queryObject(`
      UPDATE estado_correo
      SET ${fields.join(", ")}
      WHERE estado_correo_id = $${index}
      RETURNING *
      `, values);
        this.logInfo("Estado de correo actualizado", result.rows[0]);
        return result.rows.length > 0 ? result.rows[0] : undefined;
    }
    // ======================================================
    // ELIMINAR ESTADO
    // ======================================================
    async delete({ id }) {
        const client = this.connection.getClient();
        const result = await client.queryObject(`
      DELETE FROM estado_correo
      WHERE estado_correo_id = $1
      RETURNING estado_correo_id
      `, [id]);
        const success = result.rows.length > 0;
        if (success) {
            this.logInfo("Estado correo eliminado", { id });
        }
        else {
            this.logWarn("Estado correo no encontrado para eliminar", { id });
        }
        return success;
    }
    // ======================================================
    // MARCAR COMO ENTREGADO (crea nuevo registro)
    // ======================================================
    async marcarComoEntregado({ id }) {
        const client = this.connection.getClient();
        // Obtener el estado actual para copiar sap_id y usuario_id
        const estadoActual = await this.getById({ id });
        if (!estadoActual) {
            this.logWarn("Estado no encontrado para marcar como entregado", { id });
            return undefined;
        }
        // Crear nuevo registro con estado ENTREGADO
        const result = await client.queryObject(`
      INSERT INTO estado_correo (
        sap_id,
        estado,
        descripcion,
        fecha_creacion,
        usuario_id,
        ubicacion_actual
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `, [
            estadoActual.sap_id,
            "ENTREGADO",
            "Correo marcado como entregado",
            new Date(),
            estadoActual.usuario_id,
            estadoActual.ubicacion_actual,
        ]);
        this.logInfo("Correo marcado como entregado", result.rows[0]);
        return result.rows[0];
    }
    // ======================================================
    // ACTUALIZAR UBICACIÓN
    // ======================================================
    async actualizarUbicacion({ id, ubicacion }) {
        const client = this.connection.getClient();
        const result = await client.queryObject(`
      UPDATE estado_correo
      SET ubicacion_actual = $1
      WHERE estado_correo_id = $2
      RETURNING *
      `, [ubicacion.toUpperCase(), id]);
        if (result.rows.length > 0) {
            this.logInfo("Ubicación actualizada", result.rows[0]);
        }
        else {
            this.logWarn("Estado no encontrado para actualizar ubicación", { id });
        }
        return result.rows.length > 0 ? result.rows[0] : undefined;
    }
    // ======================================================
    // CONTAR ESTADOS POR TIPO
    // ======================================================
    async countByEstado({ estado }) {
        const client = this.connection.getClient();
        const result = await client.queryObject(`
      SELECT COUNT(*) as count
      FROM estado_correo
      WHERE UPPER(estado) = $1
      `, [estado.toUpperCase()]);
        return result.rows.length > 0 ? Number(result.rows[0].count) : 0;
    }
    // ======================================================
    // CONTAR HISTORIAL DE UN CORREO
    // ======================================================
    async countBySAP({ sap_id }) {
        const client = this.connection.getClient();
        const result = await client.queryObject(`
      SELECT COUNT(*) as count
      FROM estado_correo
      WHERE sap_id = $1
      `, [sap_id.toUpperCase()]);
        return result.rows.length > 0 ? Number(result.rows[0].count) : 0;
    }
    // ======================================================
    // CREAR MÚLTIPLES ESTADOS (BULK)
    // ======================================================
    async bulkCreateEstados(estados) {
        const client = this.connection.getClient();
        const results = [];
        try {
            await client.queryObject("BEGIN");
            for (const estado of estados) {
                const query = `
          INSERT INTO estado_correo (
            sap_id, estado, descripcion, fecha_creacion, usuario_id, ubicacion_actual
          ) VALUES (
            $1, $2, $3, NOW(), $4, $5
          ) RETURNING
            estado_correo_id, sap_id, estado, descripcion, fecha_creacion, usuario_id, ubicacion_actual
        `;
                const result = await client.queryObject(query, [
                    estado.sap_id?.toUpperCase(),
                    estado.estado,
                    estado.descripcion || null,
                    estado.usuario_id,
                    estado.ubicacion_actual || null,
                ]);
                if (result.rows.length > 0) {
                    results.push(result.rows[0]);
                }
            }
            await client.queryObject("COMMIT");
            this.logInfo(`Bulk create: ${results.length} estados de correo creados`);
            return results;
        }
        catch (error) {
            await client.queryObject("ROLLBACK");
            this.logError("Error en bulkCreateEstados", error);
            throw error;
        }
    }
}
//# sourceMappingURL=estadoCorreoPostgreSQL.js.map