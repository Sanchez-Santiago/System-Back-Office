import clients from "../../database/MySQL.ts";
export class PersonaModelMySQL {
    connection;
    constructor() {
        this.connection = clients;
    }
    async getAll(params) {
        const { page = 1, limit = 10, email } = params;
        let query = "SELECT * FROM personas";
        const filters = [];
        if (email)
            filters.push(`email = '${email}'`);
        if (filters.length > 0)
            query += " WHERE " + filters.join(" AND ");
        query += ` LIMIT ${limit} OFFSET ${(page - 1) * limit}`;
        const result = await this.connection.query(query);
        return result;
    }
    async getById({ id }) {
        const result = await this.connection.query("SELECT * FROM personas WHERE id_persona = ?", [id]);
        return result[0];
    }
    async add({ input }) {
        await this.connection.query(`INSERT INTO personas (id_persona, nombre, apellido, fecha_nacimiento, documento, email, telefono, tipo_documento, nacionalidad, genero, creado_en)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            input.id_persona,
            input.nombre,
            input.apellido,
            input.fecha_nacimiento,
            input.documento,
            input.email,
            input.telefono,
            input.tipo_documento,
            input.nacionalidad,
            input.genero,
            input.creado_en,
        ]);
        return input;
    }
    async update({ id, input, }) {
        const fields = Object.keys(input)
            .map((key) => `${key} = ?`)
            .join(", ");
        const values = Object.values(input);
        await this.connection.query(`UPDATE personas SET ${fields} WHERE id_persona = ?`, [...values, id]);
        return this.getById({ id });
    }
    async delete({ id }) {
        const result = await this.connection.query("DELETE FROM personas WHERE id_persona = ?", [id]);
        return result.affectedRows > 0;
    }
    async getByEmail({ email }) {
        const result = await this.connection.query("SELECT * FROM personas WHERE email = ?", [email]);
        return result[0];
    }
    async getBydocumento({ documento }) {
        const result = await this.connection.query("SELECT * FROM personas WHERE documento = ?", [documento]);
        return result[0];
    }
}
//# sourceMappingURL=personaMySQL.js.map