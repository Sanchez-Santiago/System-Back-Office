import { logger } from "../Utils/logger.ts";
export class PortabilidadPostgreSQL {
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
            logger.error("PortabilidadPostgreSQL.safeQuery:", error);
            throw error;
        }
    }
    async getAll(params = {}) {
        const { page = 1, limit = 10 } = params;
        const offset = (page - 1) * limit;
        const result = await this.safeQuery(`SELECT * FROM portabilidad LIMIT $1 OFFSET $2`, [limit, offset]);
        return result || [];
    }
    async getById({ id }) {
        const result = await this.safeQuery(`SELECT * FROM portabilidad WHERE venta_id = $1`, [id]);
        return result && result.length > 0
            ? result[0]
            : undefined;
    }
    async add({ input }) {
        await this.safeQuery(`INSERT INTO portabilidad (venta_id, spn, empresa_origen, mercado_origen, numero_portar, pin, fecha_vencimiento_pin, fecha_portacion) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, [
            input.venta,
            input.spn,
            input.empresa_origen,
            input.mercado_origen,
            input.numero_portar,
            input.pin?.toString() || null,
            input.fecha_vencimiento_pin || null,
            input.fecha_portacion || null,
        ]);
        return input;
    }
    async update({ id, input }) {
        const fields = [];
        const values = [];
        let paramIndex = 1;
        if (input.spn !== undefined) {
            fields.push(`spn = $${paramIndex++}`);
            values.push(input.spn);
        }
        if (input.empresa_origen !== undefined) {
            fields.push(`empresa_origen = $${paramIndex++}`);
            values.push(input.empresa_origen);
        }
        if (input.mercado_origen !== undefined) {
            fields.push(`mercado_origen = $${paramIndex++}`);
            values.push(input.mercado_origen);
        }
        if (input.numero_portar !== undefined) {
            fields.push(`numero_portar = $${paramIndex++}`);
            values.push(input.numero_portar);
        }
        if (input.pin !== undefined) {
            fields.push(`pin = $${paramIndex++}`);
            values.push(input.pin);
        }
        if (input.fecha_vencimiento_pin !== undefined) {
            fields.push(`fecha_vencimiento_pin = $${paramIndex++}`);
            values.push(input.fecha_vencimiento_pin);
        }
        if (fields.length === 0)
            return undefined;
        values.push(id);
        await this.safeQuery(`UPDATE portabilidad SET ${fields.join(", ")} WHERE venta_id = $${paramIndex}`, values);
        return this.getById({ id });
    }
    async delete({ id }) {
        await this.safeQuery(`DELETE FROM portabilidad WHERE venta_id = $1`, [id]);
        return true;
    }
    async getByVenta({ venta }) {
        const result = await this.safeQuery(`SELECT * FROM portabilidad WHERE venta_id = $1`, [venta]);
        return result && result.length > 0
            ? result[0]
            : undefined;
    }
    async getStatistics() {
        // Total portabilidades
        const totalResult = await this.safeQuery(`SELECT COUNT(*) as total FROM portabilidad`);
        const total = totalResult && totalResult.length > 0
            ? totalResult[0].total
            : 0;
        // By empresa_origen
        const empresaResult = await this.safeQuery(`SELECT empresa_origen, COUNT(*) as cantidad
       FROM portabilidad
       GROUP BY empresa_origen`);
        const byEmpresaOrigen = empresaResult || [];
        // By mercado_origen
        const mercadoResult = await this.safeQuery(`SELECT mercado_origen, COUNT(*) as cantidad
       FROM portabilidad
       GROUP BY mercado_origen`);
        const byMercadoOrigen = mercadoResult || [];
        return {
            total,
            byEmpresaOrigen,
            byMercadoOrigen,
        };
    }
}
//# sourceMappingURL=portabilidadPostgreSQL.js.map