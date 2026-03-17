export class EmpresaOrigenMySQL {
    connection;
    constructor(connection) {
        this.connection = connection;
    }
    async getAll(params = {}) {
        const { page = 1, limit = 10 } = params;
        const offset = (page - 1) * limit;
        const result = await this.connection.execute(`SELECT * FROM empresa_origen LIMIT ? OFFSET ?`, [limit, offset]);
        return result.rows;
    }
    async getById({ id }) {
        const result = await this.connection.execute(`SELECT * FROM empresa_origen WHERE empresa_origen_id = ?`, [id]);
        return result.rows?.[0];
    }
    async add({ input }) {
        const { nombre_empresa, pais } = input;
        const result = await this.connection.execute(`INSERT INTO empresa_origen SET nombre_empresa = ?, pais = ?`, [nombre_empresa, pais]);
        const newId = result.lastInsertId;
        return {
            empresa_origen_id: newId,
            nombre_empresa,
            pais,
        };
    }
    async update({ id, input }) {
        const fields = [];
        const values = [];
        if (input.nombre_empresa !== undefined) {
            fields.push("nombre_empresa = ?");
            values.push(input.nombre_empresa);
        }
        if (input.pais !== undefined) {
            fields.push("pais = ?");
            values.push(input.pais);
        }
        if (fields.length === 0)
            return undefined;
        values.push(id);
        const result = await this.connection.execute(`UPDATE empresa_origen SET ${fields.join(", ")} WHERE empresa_origen_id = ?`, values);
        if (result.affectedRows !== undefined && result.affectedRows > 0) {
            return this.getById({ id });
        }
        return undefined;
    }
    async delete({ id }) {
        const result = await this.connection.execute(`DELETE FROM empresa_origen WHERE empresa_origen_id = ?`, [id]);
        return result.affectedRows !== undefined && result.affectedRows > 0;
    }
}
//# sourceMappingURL=empresaOrigenMySQL.js.map