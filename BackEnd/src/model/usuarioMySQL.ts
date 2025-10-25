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

      const queryParams: (string | number)[] = []; // ✅ Acepta strings Y números

      if (name !== undefined) {
        query += ` AND (p.nombre LIKE ? OR p.apellido LIKE ?)`;
        queryParams.push(`%${name}%`, `%${name}%`);
      }

      if (email !== undefined) {
        query += ` AND p.email LIKE ?`;
        queryParams.push(`%${email}%`);
      }

      query += ` LIMIT ? OFFSET ?`;
      queryParams.push(limit, offset); // ✅ Mantiene como números

      //console.log("Query:", query);
      //console.log("Query Params:", queryParams);

      const result = await this.connection.execute(query, queryParams);

      // ✅ Acceder a result.rows
      if (!result || !result.rows || result.rows.length === 0) return undefined;

      return result.rows as Usuario[];
    } catch (error) {
      throw error;
    }
  }

  async getById({ id }: { id: string }): Promise<Usuario | undefined> {
    try {
      console.log("🔍 Buscando usuario con ID:", id);

      const result = await this.connection.execute(
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

      //console.log("📦 Result completo:", result);

      // ✅ El driver retorna { rows: [...], fields: [...] }
      if (!result || !result.rows || result.rows.length === 0) {
        console.log("❌ No se encontró el usuario");
        return undefined;
      }

      console.log("✅ Usuario encontrado"); //, result.rows[0]);
      return result.rows[0] as Usuario;
    } catch (error) {
      console.error("[ERROR] getById:", error);
      throw error;
    }
  }

  async getByEmail({ email }: { email: string }): Promise<Usuario | undefined> {
    try {
      const result = await this.connection.execute(
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
        WHERE p.email = ?
        `,
        [email],
      );

      // ✅ accedemos al array de resultados correctamente
      const rows = result.rows as Usuario[] | undefined;

      if (!rows || rows.length === 0) return undefined;

      return rows[0];
    } catch (error) {
      console.error("[ERROR] getByEmail:", error);
      throw error;
    }
  }

  async add(params: { input: UsuarioCreate }): Promise<Usuario> {
    try {
      await this.connection.execute("START TRANSACTION");

      const { input } = params;

      // ✅ Generar UUID en Deno
      const personaId = crypto.randomUUID();
      console.log("🔑 UUID generado:", personaId);

      // Insertar persona con UUID generado
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
          nacionalidad,
          genero
        ) VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?)
        `,
        [
          personaId, // ✅ UUID generado por Deno
          input.nombre,
          input.apellido,
          input.fecha_nacimiento,
          input.documento,
          input.email.toLowerCase(),
          input.telefono || null,
          input.tipo_documento,
          input.nacionalidad,
          input.genero.toUpperCase() ?? "OTRO",
        ],
      );

      console.log("✅ Persona insertada");

      // Insertar en tabla usuario
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

      console.log("✅ Usuario insertado");

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
      console.log("✅ Transacción completada");

      // Obtener el usuario completo
      const usuario = await this.getById({ id: personaId });

      if (!usuario) {
        throw new Error("Error al recuperar el usuario creado");
      }

      return usuario;
    } catch (error) {
      console.error("[ERROR] add usuario:", error);
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

      console.log(`[INFO] Iniciando eliminación del usuario: ${id}`);

      // Obtener el rol del usuario
      const userResult = await this.connection.execute(
        `SELECT rol FROM usuario WHERE persona_id = ?`,
        [id],
      );

      if (!userResult || !userResult.rows || userResult.rows.length === 0) {
        console.log(`[WARN] Usuario ${id} no encontrado`);
        await this.connection.execute("ROLLBACK");
        return false;
      }

      const rol = userResult.rows[0].rol;
      console.log(`[INFO] Usuario encontrado con rol actual: ${rol}`);

      // ✅ CORRECCIÓN: Intentar eliminar de TODAS las tablas de rol
      // (no solo del rol actual, por si cambió de rol o hay inconsistencias)

      // Verificar y eliminar de tabla supervisor
      const checkSupervisor = await this.connection.execute(
        `SELECT COUNT(*) as count FROM supervisor WHERE usuario = ?`,
        [id],
      );
      if (
        checkSupervisor.rows?.[0] !== undefined &&
        checkSupervisor.rows[0].count > 0
      ) {
        console.log(`[INFO] Usuario existe en tabla supervisor, eliminando...`);
        const delSupervisor = await this.connection.execute(
          `DELETE FROM supervisor WHERE usuario = ?`,
          [id],
        );
        console.log(
          `[INFO] ✅ Eliminado de supervisor - Affected rows: ${
            delSupervisor.affectedRows || 0
          }`,
        );
      } else {
        console.log(`[INFO] Usuario no existe en tabla supervisor`);
      }

      // Verificar y eliminar de tabla vendedor
      const checkVendedor = await this.connection.execute(
        `SELECT COUNT(*) as count FROM vendedor WHERE usuario = ?`,
        [id],
      );
      if (
        checkVendedor.rows?.[0] !== undefined &&
        checkVendedor.rows[0].count > 0
      ) {
        console.log(`[INFO] Usuario existe en tabla vendedor, eliminando...`);
        const delVendedor = await this.connection.execute(
          `DELETE FROM vendedor WHERE usuario = ?`,
          [id],
        );
        console.log(
          `[INFO] ✅ Eliminado de vendedor - Affected rows: ${
            delVendedor.affectedRows || 0
          }`,
        );
      } else {
        console.log(`[INFO] Usuario no existe en tabla vendedor`);
      }

      // Verificar y eliminar de tabla back_office
      const checkBackOffice = await this.connection.execute(
        `SELECT COUNT(*) as count FROM back_office WHERE usuario_id = ?`,
        [id],
      );
      if (
        checkBackOffice.rows?.[0] !== undefined &&
        checkBackOffice.rows[0].count > 0
      ) {
        console.log(
          `[INFO] Usuario existe en tabla back_office, eliminando...`,
        );
        const delBackOffice = await this.connection.execute(
          `DELETE FROM back_office WHERE usuario_id = ?`,
          [id],
        );
        console.log(
          `[INFO] ✅ Eliminado de back_office - Affected rows: ${
            delBackOffice.affectedRows || 0
          }`,
        );
      } else {
        console.log(`[INFO] Usuario no existe en tabla back_office`);
      }

      // ✅ Verificar si este usuario es supervisor de otros usuarios
      const checkSupervised = await this.connection.execute(
        `SELECT COUNT(*) as count FROM vendedor WHERE supervisor = ?`,
        [id],
      );
      const supervisedVendedores = checkSupervised.rows?.[0].count;

      const checkSupervisedBO = await this.connection.execute(
        `SELECT COUNT(*) as count FROM back_office WHERE supervisor = ?`,
        [id],
      );
      const supervisedBackOffice = checkSupervisedBO.rows?.[0].count;

      if (supervisedVendedores > 0 || supervisedBackOffice > 0) {
        console.log(
          `[WARN] ⚠️ Este usuario supervisa a ${supervisedVendedores} vendedores y ${supervisedBackOffice} back office`,
        );
        await this.connection.execute("ROLLBACK");
        throw new Error(
          `No se puede eliminar el usuario porque supervisa a ${
            supervisedVendedores + supervisedBackOffice
          } usuarios. ` +
            `Primero reasigne o elimine los usuarios supervisados.`,
        );
      }

      // Eliminar de tabla usuario
      const delUsuario = await this.connection.execute(
        `DELETE FROM usuario WHERE persona_id = ?`,
        [id],
      );
      console.log(
        `[INFO] ✅ Eliminado de usuario - Affected rows: ${
          delUsuario.affectedRows || 0
        }`,
      );

      // Eliminar de tabla persona
      const delPersona = await this.connection.execute(
        `DELETE FROM persona WHERE id_persona = ?`,
        [id],
      );
      console.log(
        `[INFO] ✅ Eliminado de persona - Affected rows: ${
          delPersona.affectedRows || 0
        }`,
      );

      await this.connection.execute("COMMIT");
      console.log(
        `[INFO] 🎉 Transacción de eliminación completada para usuario: ${id}`,
      );

      return (delPersona.affectedRows !== undefined &&
        delPersona.affectedRows > 0);
    } catch (error) {
      console.error("[ERROR] delete usuario:", error);
      await this.connection.execute("ROLLBACK");
      console.log("[INFO] ⚠️ Rollback ejecutado");
      throw error;
    }
  }

  async getByLegajo(
    { legajo }: { legajo: string },
  ): Promise<Usuario | undefined> {
    try {
      const result = await this.connection.execute(
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

      // ✅ Acceder a result.rows
      if (!result || !result.rows || result.rows.length === 0) return undefined;

      return result.rows[0] as Usuario;
    } catch (error) {
      throw error;
    }
  }

  async getByExa({ exa }: { exa: string }): Promise<Usuario | undefined> {
    try {
      const result = await this.connection.execute(
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

      // ✅ Acceder a result.rows
      if (!result || !result.rows || result.rows.length === 0) return undefined;

      return result.rows[0] as Usuario;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtiene el password_hash de un usuario
   * Usado internamente para verificar contraseña actual
   */
  async getPasswordHash({ id }: { id: string }): Promise<string | undefined> {
    try {
      const result = await this.connection.execute(
        `SELECT password_hash FROM usuario WHERE persona_id = ?`,
        [id],
      );

      if (!result || !result.rows || result.rows.length === 0) {
        return undefined;
      }

      return result.rows[0].password_hash;
    } catch (error) {
      console.error("[ERROR] getPasswordHash:", error);
      throw error;
    }
  }

  /**
   * Actualiza solo la contraseña de un usuario
   */
  async updatePassword(params: {
    id: string;
    newPasswordHash: string;
  }): Promise<boolean> {
    try {
      const { id, newPasswordHash } = params;

      console.log(`[INFO] Actualizando contraseña para usuario: ${id}`);

      const result = await this.connection.execute(
        `UPDATE usuario SET password_hash = ? WHERE persona_id = ?`,
        [newPasswordHash, id],
      );

      const success = result.affectedRows !== undefined &&
        result.affectedRows > 0;

      if (success) {
        console.log(`[INFO] ✅ Contraseña actualizada exitosamente`);
      } else {
        console.log(`[WARN] ⚠️ No se actualizó ninguna contraseña`);
      }

      return success;
    } catch (error) {
      console.error("[ERROR] updatePassword:", error);
      throw error;
    }
  }
}
