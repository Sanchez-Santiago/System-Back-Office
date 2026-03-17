export class EmpresaMySQL {
    connection;
    constructor(connection) {
        this.connection = connection;
    }
    async getAll(params = {}) {
        const { page = 1, limit = 10 } = params;
        const offset = (page - 1) * limit;
        const result = await this.connection.execute(`SELECT * FROM empresa LIMIT ? OFFSET ?`, [limit, offset]);
        return result.rows;
    }
    async getById({ id }) {
        const result = await this.connection.execute(`SELECT * FROM empresa WHERE id_empresa = ?`, [id]);
        return result.rows?.[0];
    }
    async add({ input }) {
        const { nombre, cuit, entidad } = input;
        const result = await this.connection.execute(`INSERT INTO empresa SET nombre = ?, cuit = ?, entidad = ?`, [nombre, cuit, entidad]);
        const newId = result.lastInsertId;
        return {
            id_empresa: newId,
            nombre,
            cuit,
            entidad,
        };
    }
    async update({ id, input }) {
        const fields = [];
        const values = [];
        if (input.nombre !== undefined) {
            fields.push("nombre = ?");
            values.push(input.nombre);
        }
        if (input.cuit !== undefined) {
            fields.push("cuit = ?");
            values.push(input.cuit);
        }
        if (input.entidad !== undefined) {
            fields.push("entidad = ?");
            values.push(input.entidad);
        }
        if (fields.length === 0)
            return undefined;
        values.push(id);
        const result = await this.connection.execute(`UPDATE empresa SET ${fields.join(", ")} WHERE id_empresa = ?`, values);
        if (result.affectedRows !== undefined && result.affectedRows > 0) {
            return this.getById({ id });
        }
        return undefined;
    }
    async delete({ id }) {
        const result = await this.connection.execute(`DELETE FROM empresa WHERE id_empresa = ?`, [id]);
        return result.affectedRows !== undefined && result.affectedRows > 0;
    }
}
//# sourceMappingURL=empresaMySQL.js.map