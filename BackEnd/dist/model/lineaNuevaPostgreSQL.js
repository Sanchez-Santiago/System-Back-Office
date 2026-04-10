import { logger } from "../Utils/logger";
export class LineaNuevaPostgreSQL {
    connection;
    constructor(connection) {
        this.connection = connection;
    }
    async safeQuery(query, params = []) {
        try {
            const client = this.connection.getClient();
            const result = await client.queryObject(query, params);
            return result.rows;
        }
        catch (error) {
            logger.error("LineaNuevaPostgreSQL.safeQuery:", error);
            throw error;
        }
    }
    async getAll(params = {}) {
        const { page = 1, limit = 10 } = params;
        const offset = (page - 1) * limit;
        const result = await this.safeQuery(`SELECT * FROM linea_nueva LIMIT $1 OFFSET $2`, [limit, offset]);
        return result || [];
    }
    async getById({ id }) {
        const result = await this.safeQuery(`SELECT * FROM linea_nueva WHERE venta_id = $1`, [id]);
        return result && result.length > 0
            ? result[0]
            : undefined;
    }
    async add({ input }) {
        const { venta } = input;
        await this.safeQuery(`INSERT INTO linea_nueva (venta_id) VALUES ($1)`, [venta]);
        return {
            ...input,
        };
    }
    async update({ id, input }) {
        // Linea nueva table only has venta_id, no other fields to update
        // Always return existing record
        return this.getById({ id });
    }
    async delete({ id }) {
        await this.safeQuery(`DELETE FROM linea_nueva WHERE venta_id = $1`, [id]);
        return true;
    }
    async getByVenta({ venta }) {
        const result = await this.safeQuery(`SELECT * FROM linea_nueva WHERE venta_id = $1`, [venta]);
        return result && result.length > 0
            ? result[0]
            : undefined;
    }
    async getStatistics() {
        // Total linea nuevas
        const totalResult = await this.safeQuery(`SELECT COUNT(*) as total FROM linea_nueva`);
        const total = totalResult && totalResult.length > 0
            ? totalResult[0].total
            : 0;
        return {
            total,
        };
    }
    // Note: linea_nueva table doesn't have estado column
    // This method is not applicable to current table structure
    async getByEstado({ estado }) {
        // Return empty array since there's no estado to filter by
        return [];
    }
}
//# sourceMappingURL=lineaNuevaPostgreSQL.js.map