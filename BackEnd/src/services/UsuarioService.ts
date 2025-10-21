import {
  UsuarioSecurity,
  UsuarioSecuritySchema,
  UsuarioUpdate,
} from "../schemas/persona/User.ts";
import { UserModelDB } from "../interface/Usuario.ts";

/**
 * Servicio de Usuario
 *
 * Capa de lógica de negocio que:
 * - Maneja operaciones CRUD de usuarios
 * - Filtra datos sensibles (password_hash) usando UsuarioSecuritySchema
 * - Proporciona una capa de abstracción entre controladores y modelo de datos
 *
 * @class UsuarioService
 */
export class UsuarioService {
  private modeUser: UserModelDB;

  /**
   * Constructor del servicio
   * @param {UserModelDB} modeUser - Modelo de base de datos para operaciones de usuario
   */
  constructor(modeUser: UserModelDB) {
    this.modeUser = modeUser;
  }

  /**
   * Obtiene todos los usuarios con paginación y filtros opcionales
   *
   * @param {Object} params - Parámetros de búsqueda
   * @param {number} [params.page=1] - Número de página
   * @param {number} [params.limit=10] - Cantidad de resultados por página
   * @param {string} [params.name] - Filtro por nombre/apellido (búsqueda parcial)
   * @param {string} [params.email] - Filtro por email (búsqueda parcial)
   * @returns {Promise<UsuarioSecurity[] | undefined>} Array de usuarios sin datos sensibles
   * @throws {Error} Si ocurre un error en la consulta a la base de datos
   *
   * @example
   * const usuarios = await usuarioService.getAll({ page: 1, limit: 20, name: "Juan" });
   */
  async getAll(params: {
    page?: number;
    limit?: number;
    name?: string;
    email?: string;
  }): Promise<UsuarioSecurity[] | undefined> {
    try {
      // Obtener usuarios de la base de datos
      const users = await this.modeUser.getAll(params);

      // Validar que existan resultados
      if (!users || users.length === 0) {
        return undefined;
      }

      // Filtrar datos sensibles de cada usuario
      const usersWithSecurity = users.map((user) =>
        UsuarioSecuritySchema.parse(user)
      );

      return usersWithSecurity;
    } catch (error) {
      console.error("[ERROR] UsuarioService.getAll:", error);
      throw new Error(
        `Error al obtener usuarios: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
      );
    }
  }

  /**
   * Obtiene un usuario específico por su ID (persona_id)
   *
   * @param {Object} params - Parámetros de búsqueda
   * @param {string} params.id - UUID del usuario (persona_id)
   * @returns {Promise<UsuarioSecurity | undefined>} Usuario sin datos sensibles o undefined si no existe
   * @throws {Error} Si ocurre un error en la consulta
   *
   * @example
   * const usuario = await usuarioService.getById({ id: "uuid-here" });
   */
  async getById({ id }: { id: string }): Promise<UsuarioSecurity | undefined> {
    try {
      // Validar que el ID no esté vacío
      if (!id || id.trim() === "") {
        throw new Error("ID de usuario requerido");
      }

      // Buscar usuario en la base de datos
      const user = await this.modeUser.getById({ id });

      // Retornar undefined si no se encuentra
      if (!user) {
        return undefined;
      }

      // Filtrar datos sensibles antes de retornar
      const userSecure = UsuarioSecuritySchema.parse(user);
      return userSecure;
    } catch (error) {
      console.error("[ERROR] UsuarioService.getById:", error);
      throw new Error(
        `Error al obtener usuario por ID: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
      );
    }
  }

  /**
   * Obtiene un usuario por su email
   *
   * @param {Object} params - Parámetros de búsqueda
   * @param {string} params.email - Email del usuario (case-insensitive)
   * @returns {Promise<UsuarioSecurity | undefined>} Usuario sin datos sensibles o undefined si no existe
   * @throws {Error} Si ocurre un error en la consulta
   *
   * @example
   * const usuario = await usuarioService.getByEmail({ email: "user@example.com" });
   */
  async getByEmail(
    { email }: { email: string },
  ): Promise<UsuarioSecurity | undefined> {
    try {
      // Validar formato de email
      if (!email || !email.includes("@")) {
        throw new Error("Email inválido");
      }

      // Buscar usuario por email (normalizado a lowercase)
      const user = await this.modeUser.getByEmail({
        email: email.toLowerCase(),
      });

      // Retornar undefined si no se encuentra
      if (!user) {
        return undefined;
      }

      // Filtrar datos sensibles antes de retornar
      const userSecure = UsuarioSecuritySchema.parse(user);
      return userSecure;
    } catch (error) {
      console.error("[ERROR] UsuarioService.getByEmail:", error);
      throw new Error(
        `Error al obtener usuario por email: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
      );
    }
  }

  /**
   * Obtiene un usuario por su legajo
   *
   * @param {Object} params - Parámetros de búsqueda
   * @param {string} params.legajo - Legajo del usuario (5 caracteres)
   * @returns {Promise<UsuarioSecurity | undefined>} Usuario sin datos sensibles o undefined si no existe
   * @throws {Error} Si ocurre un error en la consulta
   *
   * @example
   * const usuario = await usuarioService.getByLegajo({ legajo: "00001" });
   */
  async getByLegajo(
    { legajo }: { legajo: string },
  ): Promise<UsuarioSecurity | undefined> {
    try {
      // Validar que el legajo tenga el formato correcto
      if (!legajo || legajo.length !== 5) {
        throw new Error("Legajo debe tener exactamente 5 caracteres");
      }

      // Buscar usuario por legajo
      const user = await this.modeUser.getByLegajo({ legajo });

      // Retornar undefined si no se encuentra
      if (!user) {
        return undefined;
      }

      // Filtrar datos sensibles antes de retornar
      const userSecure = UsuarioSecuritySchema.parse(user);
      return userSecure;
    } catch (error) {
      console.error("[ERROR] UsuarioService.getByLegajo:", error);
      throw new Error(
        `Error al obtener usuario por legajo: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
      );
    }
  }

  /**
   * Obtiene un usuario por su código EXA
   *
   * @param {Object} params - Parámetros de búsqueda
   * @param {string} params.exa - Código EXA del usuario (8 caracteres)
   * @returns {Promise<UsuarioSecurity | undefined>} Usuario sin datos sensibles o undefined si no existe
   * @throws {Error} Si ocurre un error en la consulta
   *
   * @example
   * const usuario = await usuarioService.getByExa({ exa: "AB123456" });
   */
  async getByExa(
    { exa }: { exa: string },
  ): Promise<UsuarioSecurity | undefined> {
    try {
      // Validar que el EXA tenga el formato correcto
      if (!exa || exa.length !== 8) {
        throw new Error("Código EXA debe tener exactamente 8 caracteres");
      }

      // Buscar usuario por EXA
      const user = await this.modeUser.getByExa({ exa: exa.toUpperCase() });

      // Retornar undefined si no se encuentra
      if (!user) {
        return undefined;
      }

      // Filtrar datos sensibles antes de retornar
      const userSecure = UsuarioSecuritySchema.parse(user);
      return userSecure;
    } catch (error) {
      console.error("[ERROR] UsuarioService.getByExa:", error);
      throw new Error(
        `Error al obtener usuario por EXA: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
      );
    }
  }

  /**
   * Actualiza los datos de un usuario existente
   *
   * Solo se actualizan los campos proporcionados (actualización parcial).
   * No se puede actualizar el password_hash ni el legajo desde este método.
   *
   * @param {Object} params - Parámetros de actualización
   * @param {string} params.id - UUID del usuario a actualizar
   * @param {Partial<UsuarioUpdate>} params.input - Datos a actualizar (parcial)
   * @returns {Promise<UsuarioSecurity | undefined>} Usuario actualizado sin datos sensibles
   * @throws {Error} Si el usuario no existe o hay un error en la actualización
   *
   * @example
   * const usuarioActualizado = await usuarioService.update({
   *   id: "uuid-here",
   *   input: { telefono: "1234567890", estado: "INACTIVO" }
   * });
   */
  async update(params: {
    id: string;
    input: Partial<UsuarioUpdate>;
  }): Promise<UsuarioSecurity | undefined> {
    try {
      // Validar que el ID no esté vacío
      if (!params.id || params.id.trim() === "") {
        throw new Error("ID de usuario requerido");
      }

      // Validar que haya datos para actualizar
      if (!params.input || Object.keys(params.input).length === 0) {
        throw new Error("No hay datos para actualizar");
      }

      // Verificar que el usuario existe antes de actualizar
      const existingUser = await this.modeUser.getById({ id: params.id });
      if (!existingUser) {
        throw new Error(`Usuario con ID ${params.id} no encontrado`);
      }

      // Actualizar usuario
      const updatedUser = await this.modeUser.update(params);

      // Validar que la actualización fue exitosa
      if (!updatedUser) {
        throw new Error("Error al actualizar usuario");
      }

      // Filtrar datos sensibles antes de retornar
      const userSecure = UsuarioSecuritySchema.parse(updatedUser);
      return userSecure;
    } catch (error) {
      console.error("[ERROR] UsuarioService.update:", error);
      throw new Error(
        `Error al actualizar usuario: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
      );
    }
  }

  /**
   * Elimina un usuario de forma permanente
   *
   * ⚠️ ADVERTENCIA: Esta operación es irreversible y elimina:
   * - El registro de usuario
   * - Los datos de persona asociados
   * - Las relaciones en tablas específicas de rol (supervisor, vendedor, back_office)
   *
   * @param {Object} params - Parámetros de eliminación
   * @param {string} params.id - UUID del usuario a eliminar
   * @returns {Promise<void>}
   * @throws {Error} Si el usuario no existe o hay un error en la eliminación
   *
   * @example
   * await usuarioService.delete({ id: "uuid-here" });
   */
  async delete(params: { id: string }): Promise<void> {
    try {
      // Validar que el ID no esté vacío
      if (!params.id || params.id.trim() === "") {
        throw new Error("ID de usuario requerido");
      }

      // Verificar que el usuario existe antes de eliminar
      const existingUser = await this.modeUser.getById({ id: params.id });
      if (!existingUser) {
        throw new Error(`Usuario con ID ${params.id} no encontrado`);
      }

      // Log de la operación (para auditoría)
      console.log(`[INFO] Eliminando usuario: ${params.id}`);

      // Eliminar usuario (incluye CASCADE a tablas relacionadas)
      const deleted = await this.modeUser.delete(params);

      // Validar que la eliminación fue exitosa
      if (!deleted) {
        throw new Error("Error al eliminar usuario");
      }

      console.log(`[INFO] Usuario ${params.id} eliminado exitosamente`);
    } catch (error) {
      console.error("[ERROR] UsuarioService.delete:", error);
      throw new Error(
        `Error al eliminar usuario: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
      );
    }
  }

  /**
   * Verifica si un usuario existe por cualquiera de sus identificadores únicos
   *
   * Útil para validaciones de unicidad antes de crear usuarios.
   *
   * @param {Object} params - Parámetros de verificación
   * @param {string} [params.email] - Email a verificar
   * @param {string} [params.legajo] - Legajo a verificar
   * @param {string} [params.exa] - Código EXA a verificar
   * @returns {Promise<{exists: boolean, field?: string}>} Indica si existe y qué campo coincide
   *
   * @example
   * const existe = await usuarioService.exists({ email: "user@example.com" });
   * if (existe.exists) {
   *   console.log(`Usuario ya existe por: ${existe.field}`);
   * }
   */
  async exists(params: {
    email?: string;
    legajo?: string;
    exa?: string;
  }): Promise<{ exists: boolean; field?: string }> {
    try {
      // Verificar por email
      if (params.email) {
        const userByEmail = await this.modeUser.getByEmail({
          email: params.email.toLowerCase(),
        });
        if (userByEmail) {
          return { exists: true, field: "email" };
        }
      }

      // Verificar por legajo
      if (params.legajo) {
        const userByLegajo = await this.modeUser.getByLegajo({
          legajo: params.legajo,
        });
        if (userByLegajo) {
          return { exists: true, field: "legajo" };
        }
      }

      // Verificar por EXA
      if (params.exa) {
        const userByExa = await this.modeUser.getByExa({
          exa: params.exa.toUpperCase(),
        });
        if (userByExa) {
          return { exists: true, field: "exa" };
        }
      }

      return { exists: false };
    } catch (error) {
      console.error("[ERROR] UsuarioService.exists:", error);
      throw new Error(
        `Error al verificar existencia de usuario: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
      );
    }
  }
}
