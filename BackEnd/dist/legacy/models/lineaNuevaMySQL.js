export class LineaNuevaMySQL {
    connection;
    constructor(connection) {
        this.connection = connection;
    }
    async getAll(params = {}) {
        const { page = 1, limit = 10 } = params;
        const offset = (page - 1) * limit;
        const result = await this.connection.execute(`SELECT * FROM linea_nueva LIMIT ? OFFSET ?`, [limit, offset]);
        return result.rows ? result.rows : [];
    }
    async getById({ id }) {
        const result = await this.connection.execute(`SELECT * FROM linea_nueva WHERE venta_id = ?`, [id]);
        return result.rows && result.rows.length > 0
            ? result.rows[0]
            : undefined;
    }
    async add({ input }) {
        const { venta } = input;
        await this.connection.execute(`INSERT INTO linea_nueva (venta_id) VALUES (?)`, [venta]);
        return {
            ...input,
        };
    }
    async update({ id, input }) {
        // Linea nueva table only has venta_id, no other fields to update
        // Always return the existing record
        return this.getById({ id });
    }
    async delete({ id }) {
        const result = await this.connection.execute(`DELETE FROM linea_nueva WHERE venta_id = ?`, [id]);
        return result.affectedRows !== undefined && result.affectedRows > 0;
    }
    async getByVenta({ venta }) {
        const result = await this.connection.execute(`SELECT * FROM linea_nueva WHERE venta_id = ?`, [venta]);
        return result.rows && result.rows.length > 0
            ? result.rows[0]
            : undefined;
    }
    async getStatistics() {
        // Total linea nuevas
        const totalResult = await this.connection.execute(`SELECT COUNT(*) as total FROM linea_nueva`);
        const total = totalResult.rows && totalResult.rows.length > 0
            ? totalResult.rows[0].total
            : 0;
        return {
            total,
        };
    }
    // Note: linea_nueva table doesn't have estado column
    // This method is not applicable to the current table structure
    async getByEstado({ estado }) {
        // Return empty array since there's no estado to filter by
        return [];
    }
}
//# sourceMappingURL=lineaNuevaMySQL.js.map