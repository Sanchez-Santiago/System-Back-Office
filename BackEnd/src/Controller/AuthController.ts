import {
  UsuarioCreate,
  UsuarioCreateSchema,
  UsuarioLogin,
  UsuarioLoginSchema,
} from "../schemas/persona/User.ts";
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

      // ✅ Pasar con estructura { user: ... }
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

      // Validar con Zod
      const validated = UsuarioCreateSchema.parse(user);

      // ✅ CORRECCIÓN: Pasar { user: validated } al servicio
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
}
