import client from "../database/MySQL.ts";
import { UserModelDB } from "../interface/Usuario.ts";
import {
  Usuario,
  UsuarioCreate,
  UsuarioUpdate,
} from "../schemas/persona/User.ts";

export class UsuarioMySQL implements UserModelDB {
  connection: typeof client;

  constructor(connection: typeof client) {
    this.connection = connection;
  }

  async getAll(params: {
    page?: number;
    limit?: number;
    name?: string;
    email?: string;
  }): Promise<Usuario[] | undefined> {
    try {
      const { page = 1, limit = 10, name, email } = params;
      const offset = (page - 1) * limit;

      let query = `
        SELECT
          u.persona_id,
          u.legajo,
          u.rol,
          u.exa,
          u.password_hash,
          u.empresa_id_empresa,
          u.estado,
          p.nombre,
          p.apellido,
          p.email,
          p.documento,
          p.tipo_documento,
          p.telefono,
          p.fecha_nacimiento,
          p.nacionalidad
        FROM usuario u
        INNER JOIN persona p ON u.persona_id = p.id_persona
        WHERE 1=1
      `;

      const queryParams: string[] = [];

      if (name) {
        query += ` AND (p.nombre LIKE ? OR p.apellido LIKE ?)`;
        queryParams.push(`%${name}%`, `%${name}%`);
      }

      if (email) {
        query += ` AND p.email LIKE ?`;
        queryParams.push(`%${email}%`);
      }

      query += ` LIMIT ? OFFSET ?`;
      queryParams.push(limit.toString(), offset.toString());

      const rows = await this.connection.execute(query, queryParams);

      if (!Array.isArray(rows) || rows.length === 0) return undefined;

      return rows as Usuario[];
    } catch (error) {
      throw error;
    }
  }

  async getById({ id }: { id: string }): Promise<Usuario | undefined> {
    try {
      const rows = await this.connection.execute(
        `
        SELECT
          u.persona_id,
          u.legajo,
          u.rol,
          u.exa,
          u.password_hash,
          u.empresa_id_empresa,
          u.estado,
          p.nombre,
          p.apellido,
          p.email,
          p.documento,
          p.tipo_documento,
          p.telefono,
          p.fecha_nacimiento,
          p.nacionalidad
        FROM usuario u
        INNER JOIN persona p ON u.persona_id = p.id_persona
        WHERE u.persona_id = ?
        `,
        [id],
      );

      if (!Array.isArray(rows) || rows.length === 0) return undefined;

      return rows[0] as Usuario;
    } catch (error) {
      throw error;
    }
  }

  async getByEmail({ email }: { email: string }): Promise<Usuario | undefined> {
    const result = await this.connection.query(
      "SELECT * FROM personas WHERE usuario u inner join persona p on u.persona_id = p.id_persona where p.email = ?",
      [email],
    );
    return result[0] as Usuario | undefined;
  }

  async add(params: { input: UsuarioCreate }): Promise<Usuario> {
    try {
      await this.connection.execute("START TRANSACTION");

      const { input } = params;

      // Insertar en tabla persona (MySQL genera el UUID)
      await this.connection.execute(
        `
        INSERT INTO persona (
          id_persona,
          nombre,
          apellido,
          fecha_nacimiento,
          documento,
          email,
          creado_en,
          telefono,
          tipo_documento,
          nacionalidad
        ) VALUES (UUID(), ?, ?, ?, ?, ?, CURDATE(), ?, ?, ?)
        `,
        [
          input.nombre,
          input.apellido,
          input.fecha_nacimiento,
          input.documento,
          input.email,
          input.telefono || null,
          input.tipo_documento,
          input.nacionalidad,
        ],
      );

      // Obtener el UUID generado
      const personaRows = await this.connection.execute(
        `SELECT id_persona FROM persona WHERE id_persona = (SELECT id_persona FROM persona ORDER BY creado_en DESC LIMIT 1)`,
      );
      if (!Array.isArray(personaRows) || personaRows.length === 0) {
        return undefined;
      }
      const personaId = personaRows[0].id_persona;

      // Insertar en tabla usuario (password_hash ya viene hasheado del service)
      await this.connection.execute(
        `
        INSERT INTO usuario (
          persona_id,
          legajo,
          rol,
          exa,
          password_hash,
          empresa_id_empresa,
          estado
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          personaId,
          input.legajo,
          input.rol,
          input.exa,
          input.password_hash,
          input.empresa_id_empresa,
          input.estado || "ACTIVO",
        ],
      );

      // Insertar en tabla específica según el rol
      if (input.rol === "SUPERVISOR") {
        await this.connection.execute(
          `INSERT INTO supervisor (usuario) VALUES (?)`,
          [personaId],
        );
      } else if (input.rol === "VENDEDOR" && input.supervisor) {
        await this.connection.execute(
          `INSERT INTO vendedor (usuario, supervisor) VALUES (?, ?)`,
          [personaId, input.supervisor],
        );
      } else if (input.rol === "BACK_OFFICE" && input.supervisor) {
        await this.connection.execute(
          `INSERT INTO back_office (usuario_id, supervisor) VALUES (?, ?)`,
          [personaId, input.supervisor],
        );
      }

      await this.connection.execute("COMMIT");

      const usuario = await this.getById({ id: personaId });
      return usuario!;
    } catch (error) {
      await this.connection.execute("ROLLBACK");
      throw error;
    }
  }

  async update(params: {
    id: string;
    input: Partial<UsuarioUpdate>;
  }): Promise<Usuario | undefined> {
    try {
      await this.connection.execute("START TRANSACTION");

      const { id, input } = params;

      // Actualizar tabla persona si hay campos relacionados
      const personaFields: string[] = [];
      const personaValues: string[] = [];

      if (input.nombre) {
        personaFields.push("nombre = ?");
        personaValues.push(input.nombre);
      }
      if (input.apellido) {
        personaFields.push("apellido = ?");
        personaValues.push(input.apellido);
      }
      if (input.email) {
        personaFields.push("email = ?");
        personaValues.push(input.email);
      }
      if (input.telefono) {
        personaFields.push("telefono = ?");
        personaValues.push(input.telefono);
      }
      if (input.documento) {
        personaFields.push("documento = ?");
        personaValues.push(input.documento);
      }
      if (input.tipo_documento) {
        personaFields.push("tipo_documento = ?");
        personaValues.push(input.tipo_documento);
      }
      if (input.fecha_nacimiento) {
        personaFields.push("fecha_nacimiento = ?");
        personaValues.push(input.fecha_nacimiento);
      }
      if (input.nacionalidad) {
        personaFields.push("nacionalidad = ?");
        personaValues.push(input.nacionalidad);
      }

      if (personaFields.length > 0) {
        personaValues.push(id);
        await this.connection.execute(
          `UPDATE persona SET ${personaFields.join(", ")} WHERE id_persona = ?`,
          personaValues,
        );
      }

      // Actualizar tabla usuario si hay campos relacionados
      const usuarioFields: string[] = [];
      const usuarioValues: string[] = [];

      if (input.rol) {
        usuarioFields.push("rol = ?");
        usuarioValues.push(input.rol);
      }
      if (input.exa) {
        usuarioFields.push("exa = ?");
        usuarioValues.push(input.exa);
      }
      if (input.empresa_id_empresa) {
        usuarioFields.push("empresa_id_empresa = ?");
        usuarioValues.push(input.empresa_id_empresa);
      }
      if (input.estado) {
        usuarioFields.push("estado = ?");
        usuarioValues.push(input.estado);
      }

      if (usuarioFields.length > 0) {
        usuarioValues.push(id);
        await this.connection.execute(
          `UPDATE usuario SET ${usuarioFields.join(", ")} WHERE persona_id = ?`,
          usuarioValues,
        );
      }

      await this.connection.execute("COMMIT");

      return await this.getById({ id });
    } catch (error) {
      await this.connection.execute("ROLLBACK");
      throw error;
    }
  }

  async delete(params: { id: string }): Promise<boolean> {
    try {
      await this.connection.execute("START TRANSACTION");

      const { id } = params;

      // Obtener el rol del usuario para eliminar de tablas específicas
      const userRows = await this.connection.execute(
        `SELECT rol FROM usuario WHERE persona_id = ?`,
        [id],
      );

      if (!Array.isArray(userRows) || userRows.length === 0) {
        await this.connection.execute("ROLLBACK");
        return false;
      }

      const rol = userRows[0].rol;

      // Eliminar de tabla específica según rol
      if (rol === "SUPERVISOR") {
        await this.connection.execute(
          `DELETE FROM supervisor WHERE usuario = ?`,
          [id],
        );
      } else if (rol === "VENDEDOR") {
        await this.connection.execute(
          `DELETE FROM vendedor WHERE usuario = ?`,
          [id],
        );
      } else if (rol === "BACK_OFFICE") {
        await this.connection.execute(
          `DELETE FROM back_office WHERE usuario_id = ?`,
          [id],
        );
      }

      // Eliminar de tabla usuario
      await this.connection.execute(
        `DELETE FROM usuario WHERE persona_id = ?`,
        [id],
      );

      // Eliminar de tabla persona
      const result = await this.connection.execute(
        `DELETE FROM persona WHERE id_persona = ?`,
        [id],
      );

      await this.connection.execute("COMMIT");

      return result.affectedRows !== undefined && result.affectedRows > 0;
    } catch (error) {
      await this.connection.execute("ROLLBACK");
      throw error;
    }
  }

  async getByLegajo(
    { legajo }: { legajo: string },
  ): Promise<Usuario | undefined> {
    try {
      const rows = await this.connection.execute(
        `
        SELECT
          u.persona_id,
          u.legajo,
          u.rol,
          u.exa,
          u.password_hash,
          u.empresa_id_empresa,
          u.estado,
          p.nombre,
          p.apellido,
          p.email,
          p.documento,
          p.tipo_documento,
          p.telefono,
          p.fecha_nacimiento,
          p.nacionalidad
        FROM usuario u
        INNER JOIN persona p ON u.persona_id = p.id_persona
        WHERE u.legajo = ?
        `,
        [legajo],
      );

      if (!Array.isArray(rows) || rows.length === 0) return undefined;

      return rows[0] as Usuario;
    } catch (error) {
      throw error;
    }
  }

  async getByExa({ exa }: { exa: string }): Promise<Usuario | undefined> {
    try {
      const rows = await this.connection.execute(
        `
        SELECT
          u.persona_id,
          u.legajo,
          u.rol,
          u.exa,
          u.password_hash,
          u.empresa_id_empresa,
          u.estado,
          p.nombre,
          p.apellido,
          p.email,
          p.documento,
          p.tipo_documento,
          p.telefono,
          p.fecha_nacimiento,
          p.nacionalidad
        FROM usuario u
        INNER JOIN persona p ON u.persona_id = p.id_persona
        WHERE u.exa = ?
        `,
        [exa],
      );

      if (!Array.isArray(rows) || rows.length === 0) return undefined;

      return rows[0] as Usuario;
    } catch (error) {
      throw error;
    }
  }
}
