export class EstadoVentaMySQL {
    connection;
    constructor(connection) {
        this.connection = connection;
    }
    mapRowToEstadoVenta(row) {
        return {
            estado_id: row.estado_id,
            venta_id: row.venta_id,
            estado: row.estado, // Will be validated by Zod
            descripcion: row.descripcion,
            fecha_creacion: row.fecha_creacion,
            usuario_id: row.usuario_id,
        };
    }
    async getAll(params = {}) {
        const { page = 1, limit = 10 } = params;
        const offset = (page - 1) * limit;
        const result = await this.connection.execute("SELECT * FROM estado ORDER BY fecha_creacion DESC LIMIT ? OFFSET ?", [limit, offset]);
        return (result.rows || []).map((row) => this.mapRowToEstadoVenta(row));
    }
    async getById({ id }) {
        const result = await this.connection.execute("SELECT * FROM estado WHERE estado_id = ?", [Number(id)]);
        if (!result.rows || result.rows.length === 0)
            return undefined;
        return this.mapRowToEstadoVenta(result.rows[0]);
    }
    async getByVentaId({ venta_id }) {
        const result = await this.connection.execute("SELECT * FROM estado WHERE venta_id = ? ORDER BY fecha_creacion DESC", [venta_id]);
        return (result.rows || []).map((row) => this.mapRowToEstadoVenta(row));
    }
    async add({ input }) {
        const result = await this.connection.execute("INSERT INTO estado (venta_id, estado, descripcion, fecha_creacion, usuario_id) VALUES (?, ?, ?, ?, ?)", [input.venta_id, input.estado, input.descripcion, input.fecha_creacion, input.usuario_id]);
        const estado_id = result.lastInsertId;
        return {
            estado_id: estado_id,
            ...input,
        };
    }
    async update({ id, input }) {
        const fields = Object.keys(input);
        const values = Object.values(input);
        if (fields.length === 0)
            return true;
        const setClause = fields.map((field) => `${field} = ?`).join(", ");
        const result = await this.connection.execute(`UPDATE estado SET ${setClause} WHERE estado_id = ?`, [...values, Number(id)]);
        return (result.affectedRows ?? 0) > 0;
    }
    async delete({ id }) {
        const result = await this.connection.execute("DELETE FROM estado WHERE estado_id = ?", [Number(id)]);
        return (result.affectedRows ?? 0) > 0;
    }
}
//# sourceMappingURL=estadoVentaMySQL.js.map