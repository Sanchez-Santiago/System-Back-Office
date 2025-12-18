// ============================================
// BackEnd/src/model/usuarioMySQL.ts
// ============================================
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

  // ======================================================
  // BASE QUERY CON PERMISOS
  // ======================================================
  private baseSelect = `
    SELECT
      u.persona_id,
      u.legajo,
      u.rol,
      u.exa,
      u.password_hash,
      u.celula,
      u.estado,
      p.nombre,
      p.apellido,
      p.email,
      p.documento,
      p.tipo_documento,
      p.telefono,
      p.fecha_nacimiento,
      p.nacionalidad,
      p.genero,
      GROUP_CONCAT(pe.nombre ORDER BY pe.nombre SEPARATOR ', ') AS permisos
    FROM usuario u
    INNER JOIN persona p ON p.persona_id = u.persona_id
    LEFT JOIN permisos_has_usuario phu ON phu.persona_id = u.persona_id
    LEFT JOIN permisos pe ON pe.permisos_id = phu.permisos_id
  `;

  // ======================================================
  async getAll(params: {
    page?: number;
    limit?: number;
    name?: string;
    email?: string;
  }): Promise<Usuario[] | undefined> {
    const { page = 1, limit = 10, name, email } = params;
    const offset = (page - 1) * limit;

    let query = this.baseSelect + ` WHERE 1=1`;
    const values: (string | number)[] = [];

    if (name) {
      query += ` AND (p.nombre LIKE ? OR p.apellido LIKE ?)`;
      values.push(`%${name}%`, `%${name}%`);
    }

    if (email) {
      query += ` AND p.email LIKE ?`;
      values.push(`%${email}%`);
    }

    query += `
      GROUP BY u.persona_id
      LIMIT ? OFFSET ?
    `;
    values.push(limit, offset);

    const result = await this.connection.execute(query, values);
    if (!result.rows?.length) return undefined;

    return result.rows.map(this.mapPermisos) as Usuario[];
  }

  // ======================================================
  async getById({ id }: { id: string }): Promise<Usuario | undefined> {
    const result = await this.connection.execute(
      `
      ${this.baseSelect}
      WHERE u.persona_id = ?
      GROUP BY u.persona_id
      `,
      [id],
    );

    if (!result.rows?.length) return undefined;
    return this.mapPermisos(result.rows[0]) as Usuario;
  }

  // ======================================================
  async getByEmail({ email }: { email: string }): Promise<Usuario | undefined> {
    const result = await this.connection.execute(
      `
      ${this.baseSelect}
      WHERE p.email = ?
      GROUP BY u.persona_id
      `,
      [email],
    );

    if (!result.rows?.length) return undefined;
    return this.mapPermisos(result.rows[0]) as Usuario;
  }

  // ======================================================
  async getByLegajo({ legajo }: { legajo: string }): Promise<Usuario | undefined> {
    const result = await this.connection.execute(
      `
      ${this.baseSelect}
      WHERE u.legajo = ?
      GROUP BY u.persona_id
      `,
      [legajo],
    );

    if (!result.rows?.length) return undefined;
    return this.mapPermisos(result.rows[0]) as Usuario;
  }

  // ======================================================
  async getByExa({ exa }: { exa: string }): Promise<Usuario | undefined> {
    const result = await this.connection.execute(
      `
      ${this.baseSelect}
      WHERE u.exa = ?
      GROUP BY u.persona_id
      `,
      [exa],
    );

    if (!result.rows?.length) return undefined;
    return this.mapPermisos(result.rows[0]) as Usuario;
  }

  // ======================================================
  // MAPEO permisos string → array
  // ======================================================
  private mapPermisos(row: any) {
    return {
      ...row,
      permisos: row.permisos ? row.permisos.split(", ") : [],
    };
  }

  // ======================================================
  // OBTENER IDS DE PERMISOS POR NOMBRE
  // ======================================================
  async consultarPermisos(permisos: string[]): Promise<number[]> {
    if (permisos.length === 0) return [];

    const placeholders = permisos.map(() => "?").join(",");
    const result = await this.connection.execute(
      `
      SELECT permisos_id
      FROM permisos
      WHERE nombre IN (${placeholders})
      `,
      permisos,
    );

    return (result.rows ?? []).map((r: any) => r.permisos_id);
  }

  // ======================================================
  async add({ input }: { input: UsuarioCreate }): Promise<Usuario> {
    await this.connection.execute("START TRANSACTION");

    try {
      const personaId = crypto.randomUUID();

      await this.connection.execute(
        `
        INSERT INTO persona (
          persona_id, nombre, apellido, fecha_nacimiento,
          documento, email, creado_en, telefono,
          tipo_documento, nacionalidad, genero
        ) VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?)
        `,
        [
          personaId,
          input.nombre,
          input.apellido,
          input.fecha_nacimiento,
          input.documento,
          input.email.toLowerCase(),
          input.telefono ?? null,
          input.tipo_documento,
          input.nacionalidad,
          input.genero ?? "OTRO",
        ],
      );

      await this.connection.execute(
        `
        INSERT INTO usuario (
          persona_id, legajo, rol, exa,
          password_hash, celula, estado
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          personaId,
          input.legajo,
          input.rol,
          input.exa,
          input.password_hash,
          input.celula,
          input.estado ?? "ACTIVO",
        ],
      );

      // permisos
      const permisosIds = await this.consultarPermisos(input.permisos);
      for (const permisoId of permisosIds) {
        await this.connection.execute(
          `
          INSERT INTO permisos_has_usuario (permisos_id, persona_id)
          VALUES (?, ?)
          `,
          [permisoId, personaId],
        );
      }

      // rol específico
      if (input.rol === "VENDEDOR") {
        await this.connection.execute(
          `INSERT INTO vendedor (usuario_id) VALUES (?)`,
          [personaId],
        );
      } else if (input.rol === "SUPERVISOR") {
        await this.connection.execute(
          `INSERT INTO supervisor (usuario_id) VALUES (?)`,
          [personaId],
        );
      } else if (input.rol === "BACK_OFFICE") {
        await this.connection.execute(
          `INSERT INTO back_office (usuario) VALUES (?)`,
          [personaId],
        );
      }

      await this.connection.execute("COMMIT");

      const usuario = await this.getById({ id: personaId });
      if (!usuario) throw new Error("Usuario no recuperado");

      return usuario;
    } catch (error) {
      await this.connection.execute("ROLLBACK");
      throw error;
    }
  }

  // ======================================================
  async update({
    id,
    input,
  }: {
    id: string;
    input: Partial<UsuarioUpdate>;
  }): Promise<Usuario | undefined> {
    await this.connection.execute("START TRANSACTION");

    try {
      if (Object.keys(input).length === 0) {
        await this.connection.execute("COMMIT");
        return this.getById({ id });
      }

      if (input.permisos) {
        await this.connection.execute(
          `DELETE FROM permisos_has_usuario WHERE persona_id = ?`,
          [id],
        );

        const permisosIds = await this.consultarPermisos(input.permisos);
        for (const permisoId of permisosIds) {
          await this.connection.execute(
            `
            INSERT INTO permisos_has_usuario (permisos_id, persona_id)
            VALUES (?, ?)
            `,
            [permisoId, id],
          );
        }
      }

      await this.connection.execute("COMMIT");
      return this.getById({ id });
    } catch (error) {
      await this.connection.execute("ROLLBACK");
      throw error;
    }
  }

  // ======================================================
  async delete({ id }: { id: string }): Promise<boolean> {
    const result = await this.connection.execute(
      `DELETE FROM persona WHERE persona_id = ?`,
      [id],
    );
    return !!result.affectedRows;
  }

  // ======================================================
  async getPasswordHash({ id }: { id: string }): Promise<string | undefined> {
    const result = await this.connection.execute(
      `SELECT password_hash FROM usuario WHERE persona_id = ?`,
      [id],
    );
    return result.rows?.[0]?.password_hash;
  }

  async updatePassword({
    id,
    newPasswordHash,
  }: {
    id: string;
    newPasswordHash: string;
  }): Promise<boolean> {
    const result = await this.connection.execute(
      `UPDATE usuario SET password_hash = ? WHERE persona_id = ?`,
      [newPasswordHash, id],
    );
    return !!result.affectedRows;
  }
}
