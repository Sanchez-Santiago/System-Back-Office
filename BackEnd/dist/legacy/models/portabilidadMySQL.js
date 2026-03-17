export class PortabilidadMySQL {
    connection;
    constructor(connection) {
        this.connection = connection;
    }
    async getAll(params = {}) {
        const { page = 1, limit = 10 } = params;
        const offset = (page - 1) * limit;
        const result = await this.connection.execute(`SELECT * FROM portabilidad LIMIT ? OFFSET ?`, [limit, offset]);
        return result.rows ? result.rows : [];
    }
    async getById({ id }) {
        const result = await this.connection.execute(`SELECT * FROM portabilidad WHERE venta = ?`, [id]);
        return result.rows && result.rows.length > 0
            ? result.rows[0]
            : undefined;
    }
    async add({ input }) {
        await this.connection.execute(`INSERT INTO portabilidad (venta_id, spn, empresa_origen, mercado_origen, numero_portar, pin, fecha_portacion) VALUES (?, ?, ?, ?, ?, ?, ?)`, [
            input.venta,
            input.spn,
            input.empresa_origen,
            input.mercado_origen,
            input.numero_porta,
            input.pin?.toString() || null,
            input.fecha_portacion || null,
        ]);
        return input;
    }
    async update({ id, input }) {
        const fields = [];
        const values = [];
        if (input.spn !== undefined) {
            fields.push("spn = ?");
            values.push(input.spn);
        }
        if (input.empresa_origen !== undefined) {
            fields.push("empresa_origen = ?");
            values.push(input.empresa_origen);
        }
        if (input.mercado_origen !== undefined) {
            fields.push("mercado_origen = ?");
            values.push(input.mercado_origen);
        }
        if (input.numero_porta !== undefined) {
            fields.push("numero_porta = ?");
            values.push(input.numero_porta);
        }
        if (input.pin !== undefined) {
            fields.push("pin = ?");
            values.push(input.pin);
        }
        if (fields.length === 0)
            return undefined;
        values.push(id);
        const result = await this.connection.execute(`UPDATE portabilidad SET ${fields.join(", ")} WHERE venta = ?`, values);
        if (result.affectedRows !== undefined && result.affectedRows > 0) {
            return this.getById({ id });
        }
        return undefined;
    }
    async delete({ id }) {
        const result = await this.connection.execute(`DELETE FROM portabilidad WHERE venta = ?`, [id]);
        return result.affectedRows !== undefined && result.affectedRows > 0;
    }
    async getByVenta({ venta }) {
        const result = await this.connection.execute(`SELECT * FROM portabilidad WHERE venta_id = ?`, [venta]);
        return result.rows && result.rows.length > 0
            ? result.rows[0]
            : undefined;
    }
    async getStatistics() {
        // Total portabilidades
        const totalResult = await this.connection.execute(`SELECT COUNT(*) as total FROM portabilidad`);
        const total = totalResult.rows && totalResult.rows.length > 0
            ? totalResult.rows[0].total
            : 0;
        // By empresa_origen
        const empresaResult = await this.connection.execute(`
      SELECT empresa_origen, COUNT(*) as cantidad
      FROM portabilidad
      GROUP BY empresa_origen
    `);
        const byEmpresaOrigen = (empresaResult.rows || []).map((row) => ({
            empresa_origen: row.empresa_origen,
            cantidad: row.cantidad,
        }));
        // By mercado_origen
        const mercadoResult = await this.connection.execute(`
      SELECT mercado_origen, COUNT(*) as cantidad
      FROM portabilidad
      GROUP BY mercado_origen
    `);
        const byMercadoOrigen = (mercadoResult.rows || []).map((row) => ({
            mercado_origen: row.mercado_origen,
            cantidad: row.cantidad,
        }));
        return {
            total,
            byEmpresaOrigen,
            byMercadoOrigen,
        };
    }
    async getByEstado({ estado }) {
        const result = await this.connection.execute(`SELECT * FROM portabilidad WHERE estado = ?`, [estado]);
        return result.rows ? result.rows : [];
    }
}
//# sourceMappingURL=portabilidadMySQL.js.map