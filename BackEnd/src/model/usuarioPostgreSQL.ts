// model/usuarioPostgreSQL.ts
// ============================================
// Modelo Usuario para PostgreSQL con conexión resiliente
// Sistema que siempre funciona aunque la BD no esté disponible
// ============================================

import { ResilientPostgresConnection, safeQuery, ServiceDegradedError } from "../database/PostgreSQL.ts";
import { UserModelDB } from "../interface/Usuario.ts";
import {
  Usuario,
  UsuarioCreate,
  UsuarioUpdate,
} from "../schemas/persona/User.ts";
import { PermisoRow, RowPermisos } from "../types/userAuth.ts";
import { logger } from "../Utils/logger.ts";

export class UsuarioPostgreSQL implements UserModelDB {
  connection: ResilientPostgresConnection;

  constructor(connection: ResilientPostgresConnection) {
    this.connection = connection;
  }

  // ======================================================
  // BASE QUERY CON PERMISOS - STRING_AGG
  // ======================================================
  private baseSelect = `
    SELECT
      u.persona_id,
      u.legajo,
      u.rol,
      u.exa,
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
      STRING_AGG(pe.nombre, ', ' ORDER BY pe.nombre) AS permisos
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
    const queryParams: unknown[] = [];

    if (name) {
      query += ` AND (p.nombre ILIKE $${queryParams.length + 1} OR p.apellido ILIKE $${queryParams.length + 2})`;
      queryParams.push(`%${name}%`, `%${name}%`);
    }

    if (email) {
      query += ` AND p.email ILIKE $${queryParams.length + 1}`;
      queryParams.push(`%${email}%`);
    }

    query += `
      GROUP BY u.persona_id, p.nombre, p.apellido, p.email, p.documento, 
                p.tipo_documento, p.telefono, p.fecha_nacimiento, 
                p.nacionalidad, p.genero, u.legajo, u.rol, u.exa, 
                u.celula, u.estado
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `;
    queryParams.push(limit, offset);

    const safeResult = await safeQuery(
      this.connection,
      query,
      queryParams
    );

    if (!safeResult.success) {
      logger.warn("getAll() - Modo degradado, retornando array vacío");
      return [];
    }

    return safeResult.data?.rows.map(this.mapPermisos) as Usuario[];
  }

  // ======================================================
  async getById({ id }: { id: string }): Promise<Usuario | undefined> {
    const safeResult = await safeQuery(
      this.connection,
      `${this.baseSelect} WHERE u.persona_id = $1 GROUP BY u.persona_id, p.nombre, p.apellido, p.email, p.documento, 
                p.tipo_documento, p.telefono, p.fecha_nacimiento, 
                p.nacionalidad, p.genero, u.legajo, u.rol, u.exa, 
                u.celula, u.estado`,
      [id]
    );

    if (!safeResult.success) {
      throw new ServiceDegradedError("Servicio de usuarios no disponible - Modo degradado");
    }

    return safeResult.data?.rows[0] as Usuario;
  }

  // ======================================================
  async getByEmail({ email }: { email: string }): Promise<Usuario | undefined> {
    const safeResult = await safeQuery(
      this.connection,
      `${this.baseSelect} WHERE p.email ILIKE $1 GROUP BY u.persona_id, p.nombre, p.apellido, p.email, p.documento, 
                p.tipo_documento, p.telefono, p.fecha_nacimiento, 
                p.nacionalidad, p.genero, u.legajo, u.rol, u.exa, 
                u.celula, u.estado`,
      [email.toLowerCase()]
    );

    if (!safeResult.success) {
      throw new ServiceDegradedError("Servicio de usuarios no disponible - Modo degradado");
    }

    return safeResult.data?.rows[0] as Usuario;
  }

  // ======================================================
  async getByLegajo(
    { legajo }: { legajo: string },
  ): Promise<Usuario | undefined> {
    const safeResult = await safeQuery(
      this.connection,
      `${this.baseSelect} WHERE u.legajo = $1 GROUP BY u.persona_id, p.nombre, p.apellido, p.email, p.documento, 
                p.tipo_documento, p.telefono, p.fecha_nacimiento, 
                p.nacionalidad, p.genero, u.legajo, u.rol, u.exa, 
                u.celula, u.estado`,
      [legajo]
    );

    if (!safeResult.success) {
      throw new ServiceDegradedError("Servicio de usuarios no disponible - Modo degradado");
    }

    return safeResult.data?.rows[0] as Usuario;
  }

  // ======================================================
  async getByExa({ exa }: { exa: string }): Promise<Usuario | undefined> {
    const safeResult = await safeQuery(
      this.connection,
      `${this.baseSelect} WHERE u.exa = $1 GROUP BY u.persona_id, p.nombre, p.apellido, p.email, p.documento, 
                p.tipo_documento, p.telefono, p.fecha_nacimiento, 
                p.nacionalidad, p.genero, u.legajo, u.rol, u.exa, 
                u.celula, u.estado`,
      [exa]
    );

    if (!safeResult.success) {
      throw new ServiceDegradedError("Servicio de usuarios no disponible - Modo degradado");
    }

    return safeResult.data?.rows[0] as Usuario;
  }

  // ======================================================
  // MAPEO permisos string → array
  // ======================================================
  private mapPermisos(row: RowPermisos) {
    return {
      ...row,
      permisos: row.permisos ? row.permisos.split(", ") : [],
    };
  }

  // ======================================================
  // OBTENER IDS DE PERMISOS POR NOMBRE
  // ======================================================
  async consultarPermisos(permisos: string[]): Promise<string[]> {
    if (permisos.length === 0) return [];

    const placeholders = permisos.map((_, i) => `$${i + 1}`).join(",");

    const safeResult = await safeQuery(
      this.connection,
      `SELECT permisos_id FROM permisos WHERE nombre IN (${placeholders})`,
      permisos
    );

    if (!safeResult.success) {
      return [];
    }

    return (safeResult.data?.rows || []).map((r: any) => r.permisos_id);
  }

  // ======================================================
  // CREAR USUARIO CON HISTORIAL DE CONTRASEÑAS
  // ======================================================
  async add({ input }: { input: UsuarioCreate }): Promise<Usuario> {
    const personaId = crypto.randomUUID();
    const now = new Date();

    // 1. Insertar persona
    const personaResult = await safeQuery(
      this.connection,
      `INSERT INTO persona (
        persona_id, nombre, apellido, fecha_nacimiento,
        documento, email, creado_en, telefono,
        tipo_documento, nacionalidad, genero
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        personaId,
        input.nombre,
        input.apellido,
        input.fecha_nacimiento,
        input.documento,
        input.email.toLowerCase(),
        now,
        input.telefono ?? null,
        input.tipo_documento,
        input.nacionalidad,
        input.genero ?? "OTRO",
      ]
    );

    if (!personaResult.success) {
      throw new ServiceDegradedError("Error al crear usuario - Base de datos no disponible");
    }

    // 2. Insertar usuario
    const usuarioResult = await safeQuery(
      this.connection,
      `INSERT INTO usuario (
        persona_id, legajo, rol, exa,
        celula, estado
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        personaId,
        input.legajo,
        input.rol,
        input.exa,
        input.celula,
        input.estado ?? "ACTIVO",
      ]
    );

    if (!usuarioResult.success) {
      throw new ServiceDegradedError("Error al crear usuario - Base de datos no disponible");
    }

    // 3. Insertar contraseña
    const passwordResult = await safeQuery(
      this.connection,
      `INSERT INTO password (
        password_hash, usuario_persona_id, fecha_creacion, activa
      ) VALUES ($1, $2, $3, true)`,
      [input.password_hash, personaId, now]
    );

    if (!passwordResult.success) {
      throw new ServiceDegradedError("Error al crear usuario - Base de datos no disponible");
    }

    // 4. Insertar permisos
    const permisosIds = await this.consultarPermisos(input.permisos);
    for (const permisoId of permisosIds) {
      const permisoResult = await safeQuery(
        this.connection,
        `INSERT INTO permisos_has_usuario (permisos_id, persona_id) VALUES ($1, $2)`,
        [permisoId, personaId]
      );

      if (!permisoResult.success) {
        logger.warn(`No se pudo asignar permiso ${permisoId} al usuario ${personaId}`);
      }
    }

    // 5. Insertar en tabla específica del rol
    let rolTable = "";
    let rolParams: unknown[] = [];

    if (input.rol === "VENDEDOR") {
      rolTable = `vendedor`;
      rolParams = [personaId];
    } else if (input.rol === "SUPERVISOR") {
      rolTable = `supervisor`;
      rolParams = [personaId];
    } else if (input.rol === "BACK_OFFICE") {
      rolTable = `back_office`;
      rolParams = [personaId];
    }

    if (rolTable && rolParams.length > 0) {
      const rolResult = await safeQuery(
        this.connection,
        `INSERT INTO ${rolTable} (usuario_id) VALUES ($1)`,
        rolParams
      );

      if (!rolResult.success) {
        logger.warn(`No se pudo asignar rol ${input.rol} al usuario ${personaId}`);
      }
    }

    // Retornar el usuario creado
    return await this.getById({ id: personaId });
  }

  // ======================================================
  async update({
    id,
    input,
  }: {
    id: string;
    input: Partial<UsuarioUpdate>;
  }): Promise<Usuario | undefined> {
    // Actualizar permisos si se proporcionan
    if (input.permisos) {
      const deleteResult = await safeQuery(
        this.connection,
        `DELETE FROM permisos_has_usuario WHERE persona_id = $1`,
        [id]
      );

      if (!deleteResult.success) {
        logger.warn(`No se pudieron eliminar permisos antiguos del usuario ${id}`);
      }

      const permisosIds = await this.consultarPermisos(input.permisos);
      for (const permisoId of permisosIds) {
        const permisoResult = await safeQuery(
          this.connection,
          `INSERT INTO permisos_has_usuario (permisos_id, persona_id) VALUES ($1, $2)`,
          [permisoId, id]
        );

        if (!permisoResult.success) {
          logger.warn(`No se pudo asignar permiso ${permisoId} al usuario ${id}`);
        }
      }
    }

    return await this.getById({ id });
  }

  // ======================================================
  async delete({ id }: { id: string }): Promise<boolean> {
    const result = await safeQuery(
      this.connection,
      `DELETE FROM persona WHERE persona_id = $1`,
      [id]
    );

    if (!result.success) {
      logger.warn(`No se pudo eliminar usuario ${id} - Base de datos no disponible`);
      return false;
    }

    return true;
  }

  // ======================================================
  async getPasswordHash({ id }: { id: string }): Promise<string | undefined> {
    const result = await safeQuery(
      this.connection,
      `
      SELECT pw.password_hash
      FROM password pw
      INNER JOIN usuario u ON pw.usuario_persona_id = u.persona_id
      WHERE pw.usuario_persona_id = $1
        AND pw.activa = true
      ORDER BY pw.fecha_creacion DESC
      LIMIT 1
      `,
      [id]
    );

    if (!result.success) {
      logger.warn(`No se pudo obtener contraseña del usuario ${id} - Base de datos no disponible`);
      return undefined;
    }

    return result.data?.rows[0]?.password_hash;
  }

  // ======================================================
  async updatePassword({
    id,
    newPasswordHash,
  }: {
    id: string;
    newPasswordHash: string;
  }): Promise<boolean> {
    const now = new Date();

    // 1. Desactivar todas las contraseñas anteriores
    const deactivateResult = await safeQuery(
      this.connection,
      `UPDATE password SET activa = false WHERE usuario_persona_id = $1`,
      [id]
    );

    if (!deactivateResult.success) {
      logger.warn(`No se pudieron desactivar contraseñas del usuario ${id}`);
      return false;
    }

    // 2. Insertar la nueva contraseña como activa
    const insertResult = await safeQuery(
      this.connection,
      `INSERT INTO password (
        password_hash, usuario_persona_id, fecha_creacion, activa
      ) VALUES ($1, $2, $3, true)`,
      [newPasswordHash, id, now]
    );

    if (!insertResult.success) {
      logger.warn(`No se pudo insertar nueva contraseña del usuario ${id}`);
      return false;
    }

    return true;
  }

  // ======================================================
  async isPasswordUsedBefore({
    id,
    passwordHash,
  }: {
    id: string;
    passwordHash: string;
  }): Promise<boolean> {
    const result = await safeQuery(
      this.connection,
      `SELECT COUNT(*) as count FROM password WHERE usuario_persona_id = $1 AND password_hash = $2`,
      [id, passwordHash]
    );

    if (!result.success) {
      return false;
    }

    const count = result.data?.rows[0]?.count || 0;
    return count > 0;
  }

  // ======================================================
  async getFailedAttemptsDB({ id }: { id: string }): Promise<number> {
    const result = await safeQuery(
      this.connection,
      `SELECT intentos_fallidos FROM password WHERE usuario_persona_id = $1 AND activa = true`,
      [id]
    );

    if (!result.success) {
      return 0;
    }

    return result.data?.rows[0]?.intentos_fallidos || 0;
  }

  // ======================================================
  async incrementFailedAttemptsDB({ id }: { id: string }): Promise<boolean> {
    const result = await safeQuery(
      this.connection,
      `UPDATE password SET intentos_fallidos = intentos_fallidos + 1 WHERE usuario_persona_id = $1 AND activa = true`,
      [id]
    );

    return result.success;
  }

  // ======================================================
  async resetFailedAttemptsDB({ id }: { id: string }): Promise<boolean> {
    const result = await safeQuery(
      this.connection,
      `UPDATE password SET intentos_fallidos = 0 WHERE usuario_persona_id = $1 AND activa = true`,
      [id]
    );

    return result.success;
  }

  // ======================================================
  async getPasswordHistory({
    id,
    limit = 5,
  }: {
    id: string;
    limit?: number;
  }): Promise<Array<{ password_hash: string; fecha_creacion: Date }>> {
    const result = await safeQuery(
      this.connection,
      `SELECT password_hash, fecha_creacion FROM password WHERE usuario_persona_id = $1 ORDER BY fecha_creacion DESC LIMIT $2`,
      [id, limit]
    );

    if (!result.success) {
      return [];
    }

    return (result.data?.rows || []) as Array<{
      password_hash: string;
      fecha_creacion: Date;
    }>;
  }
}