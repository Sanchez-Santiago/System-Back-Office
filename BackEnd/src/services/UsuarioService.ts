// ============================================
// BackEnd/src/services/UsuarioService.ts (ACTUALIZADO)
// ============================================
import {
  UsuarioSecurity,
  UsuarioSecuritySchema,
  UsuarioUpdate,
} from "../schemas/persona/User.ts";
import { UserModelDB } from "../interface/Usuario.ts";

/**
 * Servicio de Usuario
 * ✅ ACTUALIZADO: Adaptado para trabajar sin password_hash en usuario
 */
export class UsuarioService {
  private modeUser: UserModelDB;

  constructor(modeUser: UserModelDB) {
    this.modeUser = modeUser;
  }

  /**
   * Obtiene todos los usuarios con paginación y filtros opcionales
   */
  async getAll(params: {
    page?: number;
    limit?: number;
    name?: string;
    email?: string;
  }): Promise<UsuarioSecurity[] | undefined> {
    try {
      const page = params.page || 1;
      const limit = params.limit || 10;

      if (page < 1 || limit < 1) {
        throw new Error("Los valores de paginación deben ser mayores a 0");
      }

      if (limit > 100) {
        throw new Error("El límite máximo es 100 usuarios por página");
      }

      console.log(
        `[INFO] Obteniendo usuarios - Página: ${page}, Límite: ${limit}`,
      );

      const users = await this.modeUser.getAll(params);

      if (!users || users.length === 0) {
        return undefined;
      }

      // ✅ Ya no necesitamos filtrar password_hash porque no está en la consulta
      const usersWithSecurity = users.map((user) =>
        UsuarioSecuritySchema.parse(user)
      );

      console.log(`[INFO] ${usersWithSecurity.length} usuarios encontrados`);

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
   * Obtiene un usuario específico por su ID
   */
  async getById({ id }: { id: string }): Promise<UsuarioSecurity | undefined> {
    try {
      if (!id || id.trim() === "") {
        throw new Error("ID de usuario requerido");
      }

      console.log(`[INFO] Buscando usuario por ID: ${id}`);

      const user = await this.modeUser.getById({ id });

      if (!user) {
        return undefined;
      }

      console.log(`[INFO] Usuario encontrado: ${user.email}`);

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
   */
  async getByEmail(
    { email }: { email: string },
  ): Promise<UsuarioSecurity | undefined> {
    try {
      if (!email || email.trim() === "") {
        throw new Error("Email requerido");
      }

      if (!email.includes("@")) {
        throw new Error("Formato de email inválido");
      }

      console.log(`[INFO] Buscando usuario por email: ${email}`);

      const user = await this.modeUser.getByEmail({
        email: email.toLowerCase(),
      });

      if (!user) {
        return undefined;
      }

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
   */
  async getByLegajo(
    { legajo }: { legajo: string },
  ): Promise<UsuarioSecurity | undefined> {
    try {
      if (!legajo || legajo.trim() === "") {
        throw new Error("Legajo requerido");
      }

      if (legajo.length !== 5) {
        throw new Error("El legajo debe tener exactamente 5 caracteres");
      }

      console.log(`[INFO] Buscando usuario por legajo: ${legajo}`);

      const user = await this.modeUser.getByLegajo({ legajo });

      if (!user) {
        return undefined;
      }

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
   */
  async getByExa(
    { exa }: { exa: string },
  ): Promise<UsuarioSecurity | undefined> {
    try {
      if (!exa || exa.trim() === "") {
        throw new Error("Código EXA requerido");
      }

      if (exa.length !== 8) {
        throw new Error("El código EXA debe tener exactamente 8 caracteres");
      }

      console.log(`[INFO] Buscando usuario por EXA: ${exa}`);

      const user = await this.modeUser.getByExa({ exa: exa.toUpperCase() });

      if (!user) {
        return undefined;
      }

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
   * ✅ NOTA: La contraseña se actualiza a través de AuthService.changePassword()
   */
  async update(params: {
    id: string;
    input: Partial<UsuarioUpdate>;
  }): Promise<UsuarioSecurity | undefined> {
    try {
      if (!params.id || params.id.trim() === "") {
        throw new Error("ID de usuario requerido");
      }

      if (!params.input || Object.keys(params.input).length === 0) {
        throw new Error("No hay datos para actualizar");
      }

      console.log(`[INFO] Actualizando usuario: ${params.id}`);

      // Verificar que el usuario existe
      const existingUser = await this.modeUser.getById({ id: params.id });
      if (!existingUser) {
        throw new Error(`Usuario con ID ${params.id} no encontrado`);
      }

      // Normalizar datos
      const normalizedInput = { ...params.input };

      if (normalizedInput.email) {
        normalizedInput.email = normalizedInput.email.toLowerCase();
      }
      if (normalizedInput.nombre) {
        normalizedInput.nombre = normalizedInput.nombre.toUpperCase();
      }
      if (normalizedInput.apellido) {
        normalizedInput.apellido = normalizedInput.apellido.toUpperCase();
      }
      if (normalizedInput.exa) {
        normalizedInput.exa = normalizedInput.exa.toUpperCase();
      }
      if (normalizedInput.tipo_documento) {
        normalizedInput.tipo_documento = normalizedInput.tipo_documento.toUpperCase();
      }
      if (normalizedInput.nacionalidad) {
        normalizedInput.nacionalidad = normalizedInput.nacionalidad.toUpperCase();
      }

      const updatedUser = await this.modeUser.update({
        id: params.id,
        input: normalizedInput,
      });

      if (!updatedUser) {
        throw new Error("Error al actualizar usuario");
      }

      console.log(
        `[INFO] Usuario actualizado exitosamente: ${updatedUser.email}`,
      );

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
   * ✅ NOTA: El CASCADE DELETE eliminará automáticamente las contraseñas
   */
  async delete(params: { id: string }): Promise<void> {
    try {
      if (!params.id || params.id.trim() === "") {
        throw new Error("ID de usuario requerido");
      }

      console.log(`[INFO] Eliminando usuario: ${params.id}`);

      const existingUser = await this.modeUser.getById({ id: params.id });
      if (!existingUser) {
        throw new Error(`Usuario con ID ${params.id} no encontrado`);
      }

      const deleted = await this.modeUser.delete(params);

      if (!deleted) {
        throw new Error("Error al eliminar usuario");
      }

      console.log(`[INFO] Usuario ${params.id} eliminado exitosamente (incluyendo historial de contraseñas)`);
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
   * Verifica si un usuario existe
   */
  async exists(params: {
    email?: string;
    legajo?: string;
    exa?: string;
  }): Promise<{ exists: boolean; field?: string }> {
    try {
      if (!params.email && !params.legajo && !params.exa) {
        throw new Error("Debe proporcionar al menos un campo para verificar");
      }

      console.log("[INFO] Verificando existencia de usuario");

      if (params.email) {
        const userByEmail = await this.modeUser.getByEmail({
          email: params.email.toLowerCase(),
        });
        if (userByEmail) {
          return { exists: true, field: "email" };
        }
      }

      if (params.legajo) {
        const userByLegajo = await this.modeUser.getByLegajo({
          legajo: params.legajo,
        });
        if (userByLegajo) {
          return { exists: true, field: "legajo" };
        }
      }

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

  /**
   * Obtiene estadísticas de usuarios
   */
  async getStats(): Promise<{
    total: number;
    porRol: Record<string, number>;
    porEstado: Record<string, number>;
  }> {
    try {
      console.log("[INFO] Obteniendo estadísticas de usuarios");

      const usuarios = await this.modeUser.getAll({ page: 1, limit: 10000 });

      if (!usuarios || usuarios.length === 0) {
        return {
          total: 0,
          porRol: {},
          porEstado: {},
        };
      }

      const porRol: Record<string, number> = {};
      const porEstado: Record<string, number> = {};

      usuarios.forEach((usuario) => {
        porRol[usuario.rol] = (porRol[usuario.rol] || 0) + 1;
        porEstado[usuario.estado] = (porEstado[usuario.estado] || 0) + 1;
      });

      const stats = {
        total: usuarios.length,
        porRol,
        porEstado,
      };

      console.log(`[INFO] Estadísticas calculadas: ${stats.total} usuarios`);

      return stats;
    } catch (error) {
      console.error("[ERROR] UsuarioService.getStats:", error);
      throw new Error(
        `Error al obtener estadísticas: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
      );
    }
  }

  /**
   * Cambia el estado de un usuario
   */
  async changeStatus(params: {
    id: string;
    estado: "ACTIVO" | "INACTIVO" | "SUSPENDIDO";
  }): Promise<UsuarioSecurity> {
    try {
      if (!params.id || params.id.trim() === "") {
        throw new Error("ID de usuario requerido");
      }

      const estadosValidos = ["ACTIVO", "INACTIVO", "SUSPENDIDO"];
      if (!estadosValidos.includes(params.estado)) {
        throw new Error(
          `Estado inválido. Debe ser uno de: ${estadosValidos.join(", ")}`,
        );
      }

      console.log(
        `[INFO] Cambiando estado de usuario ${params.id} a ${params.estado}`,
      );

      const usuarioActualizado = await this.update({
        id: params.id,
        input: { estado: params.estado },
      });

      if (!usuarioActualizado) {
        throw new Error("Error al cambiar estado de usuario");
      }

      console.log(`[INFO] Estado actualizado exitosamente`);

      return usuarioActualizado;
    } catch (error) {
      console.error("[ERROR] UsuarioService.changeStatus:", error);
      throw new Error(
        `Error al cambiar estado de usuario: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
      );
    }
  }
}
