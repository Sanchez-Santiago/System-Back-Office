// ============================================
// BackEnd/src/Controller/AuthController.ts
// ============================================
import {
  UsuarioCreate,
  UsuarioCreateSchema,
  UsuarioLogin,
  UsuarioLoginSchema,
  CambioPassword,
  CambioPasswordAdmin,
  CambioPasswordAdminSchema,
  CambioPasswordSchema,
} from "../schemas/persona/User.ts";
import type { AuthenticatedUser, PasswordDataRaw } from "../types/userAuth.ts";
import { UserModelDB } from "../interface/Usuario.ts";
import { AuthService } from "../services/AuthService.ts";
import { manejoDeError } from "../Utils/errores.ts";
import { config } from "dotenv";

config({ export: true });

export class AuthController {
  private modeUser: UserModelDB;
  private authService: AuthService;

  constructor(modeUser: UserModelDB) {
    this.modeUser = modeUser;
    this.authService = new AuthService(modeUser);
  }

  async login(input: { user: UsuarioLogin }) {
    try {
      const email = input.user.email;
      const userOriginal = await this.modeUser.getByEmail({
        email: email.toLowerCase(),
      });

      if (!userOriginal) {
        throw new Error("Correo no encontrado");
      }

      if (!input.user.password) {
        throw new Error("Falta contraseña");
      }

      if (!input.user.email) {
        throw new Error("Falta email");
      }

      const validatedUser = UsuarioLoginSchema.parse(input.user);
      const userLogin = await this.authService.login({ user: validatedUser });

      return userLogin;
    } catch (error) {
      manejoDeError("Error en el login Controller", error);
      throw error;
    }
  }

  async register(input: { user: UsuarioCreate }) {
    try {
      if (!input || !input.user) {
        throw new Error("Datos de usuario no proporcionados");
      }

      const user = input.user;
      const validated = UsuarioCreateSchema.parse(user);

      const userCreate = await this.authService.register({ user: validated });

      if (!userCreate) {
        throw new Error("Error al crear el usuario");
      }

      return userCreate;
    } catch (error) {
      manejoDeError("Error en el registro Controller", error);
      throw error;
    }
  }

  async verifyToken(token: string) {
    try {
      if (!token) {
        throw new Error("Token no proporcionado");
      }

      const payload = await this.authService.verifyToken(token);
      return payload;
    } catch (error) {
      manejoDeError("Error en la verificación del token", error);
      throw new Error("Token inválido");
    }
  }

  async refreshToken(oldToken: string) {
    try {
      if (!oldToken) {
        throw new Error("Token no proporcionado");
      }

      const newToken = await this.authService.refreshToken(oldToken);
      return newToken;
    } catch (error) {
      manejoDeError("Error al refrescar token", error);
      throw error;
    }
  }

  /**
   * Cambia la contraseña de un usuario
   *
   * Puede ser:
   * - El mismo usuario cambiando su contraseña (requiere contraseña actual)
   * - Un BACK_OFFICE cambiando la contraseña de otro (no requiere contraseña actual)
   *
   * @param params.targetUserId - ID del usuario cuya contraseña se va a cambiar
   * @param params.authenticatedUser - Usuario autenticado (del middleware)
   * @param params.passwordData - Datos de contraseñas (sin validar)
   */
  async changePassword(params: {
    targetUserId: string;
    authenticatedUser: AuthenticatedUser;
    passwordData: PasswordDataRaw;
  }): Promise<void> {
    try {
      const { targetUserId, authenticatedUser, passwordData } = params;

      if (!targetUserId || targetUserId.trim() === "") {
        throw new Error("ID de usuario requerido");
      }

      console.log(`[INFO] Cambio de contraseña solicitado`);
      console.log(
        `[INFO] Usuario autenticado: ${authenticatedUser.email} (${authenticatedUser.rol})`,
      );
      console.log(`[INFO] Usuario objetivo: ${targetUserId}`);

      const isSelfChange = authenticatedUser.id === targetUserId;
      // ✅ ACTUALIZADO: Solo BACK_OFFICE tiene permisos de admin
      const isAdmin = authenticatedUser.rol === "BACK_OFFICE";

      let validatedData: CambioPassword | CambioPasswordAdmin;

      if (isSelfChange) {
        const result = CambioPasswordSchema.safeParse(passwordData);

        if (!result.success) {
          throw new Error(
            `Validación fallida: ${
              result.error.errors.map((error: any) => error.message).join(", ")
            }`,
          );
        }

        validatedData = result.data;
      } else if (isAdmin) {
        const result = CambioPasswordAdminSchema.safeParse(passwordData);

        if (!result.success) {
          throw new Error(
            `Validación fallida: ${
              result.error.errors.map((error: any) => error.message).join(", ")
            }`,
          );
        }

        validatedData = result.data;
      } else {
        throw new Error("No tienes permisos para cambiar esta contraseña");
      }

      await this.authService.changePassword({
        targetUserId,
        authenticatedUserId: authenticatedUser.id,
        authenticatedUserRole: authenticatedUser.rol,
        passwordData: validatedData,
      });

      console.log("[INFO] ✅ Contraseña cambiada exitosamente");
    } catch (error) {
      console.error("[ERROR] AuthController.changePassword:", error);
      throw error;
    }
  }
}
