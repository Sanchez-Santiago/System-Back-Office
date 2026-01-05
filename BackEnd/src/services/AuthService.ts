// ============================================
// BackEnd/src/services/AuthService.ts
// ============================================
import {
  CambioPassword,
  CambioPasswordAdmin,
  UsuarioCreate,
  UsuarioLogin,
} from "../schemas/persona/User.ts";
import { PersonaCreate } from "../schemas/persona/Persona.ts";
import { UserModelDB } from "../interface/Usuario.ts";
import { create, getNumericDate, verify } from "djwt";
import { compare, hash } from "bcrypt";
import { config } from "dotenv";

config({ export: true });

export class AuthService {
  private modeUser: UserModelDB;

  constructor(modeUser: UserModelDB) {
    this.modeUser = modeUser;
  }

  private async createJWTKey(secret: string): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);

    return await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign", "verify"],
    );
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

      // Verificar si cuenta está bloqueada
      const isLocked = await this.modeUser.isAccountLocked({
        id: userOriginal.persona_id,
      });
      if (isLocked) {
        const lockInfo = await this.modeUser.getFailedAttempts({
          id: userOriginal.persona_id,
        });
        const remainingTime = lockInfo.locked_until
          ? Math.ceil((lockInfo.locked_until.getTime() - new Date().getTime()) / (1000 * 60))
          : 0;
        throw new Error(
          `Cuenta bloqueada. Intentos restantes: ${15 - lockInfo.failed_attempts}. Tiempo restante: ${remainingTime} minutos.`
        );
      }

      const passwordHash = await this.modeUser.getPasswordHash({
        id: userOriginal.persona_id,
      });

      if (!passwordHash) {
        throw new Error("Password incorrecto");
      }

      const isValidPassword = await compare(
        input.user.password,
        passwordHash,
      );

      if (!isValidPassword) {
        // Incrementar intentos fallidos
        await this.modeUser.incrementFailedAttempts({
          id: userOriginal.persona_id,
        });

        // Verificar si ahora está bloqueada
        const nowLocked = await this.modeUser.isAccountLocked({
          id: userOriginal.persona_id,
        });
        if (nowLocked) {
          throw new Error(
            "Cuenta bloqueada por demasiados intentos fallidos. Contacte al administrador."
          );
        }

        const attemptsInfo = await this.modeUser.getFailedAttempts({
          id: userOriginal.persona_id,
        });
        throw new Error(
          `Password incorrecto. Intentos restantes: ${15 - attemptsInfo.failed_attempts}`
        );
      }

      // Resetear intentos en login exitoso
      await this.modeUser.resetFailedAttempts({
        id: userOriginal.persona_id,
      });

      const jwtSecret = Deno.env.get("JWT_SECRET");
      if (!jwtSecret) {
        throw new Error("JWT_SECRET not found");
      }

      const cryptoKey = await this.createJWTKey(jwtSecret);

      const token = await create(
        { alg: "HS256", typ: "JWT" },
        {
          id: userOriginal.persona_id,
          email: userOriginal.email,
          rol: userOriginal.rol,
          permisos: userOriginal.permisos.map((permiso: string) =>
            permiso.toUpperCase()
          ),
          legajo: userOriginal.legajo,
          exa: userOriginal.exa,
          exp: getNumericDate(60 * 60 * 6),
        },
        cryptoKey,
      );

      return {
        token,
        user: {
          id: userOriginal.persona_id,
          email: userOriginal.email,
          nombre: userOriginal.nombre,
          apellido: userOriginal.apellido,
          exa: userOriginal.exa,
          legajo: userOriginal.legajo,
          rol: userOriginal.rol,
          permisos: userOriginal.permisos.map((permiso: string) =>
            permiso.toUpperCase()
          ),
        },
      };
    } catch (error) {
      console.error("[ERROR] Login:", error);
      throw error;
    }
  }

  async register(input: { user: UsuarioCreate }) {
    try {
      if (!input || !input.user) {
        throw new Error("Datos de usuario no proporcionados");
      }

      const user = input.user;

      if (!user.password_hash || user.password_hash.length < 6) {
        throw new Error("Password inválido (mínimo 6 caracteres)");
      }

      // Validar unicidad
      const existingUserByLegajo = await this.modeUser.getByLegajo({
        legajo: user.legajo,
      });

      const existingUserByEmail = await this.modeUser.getByEmail({
        email: user.email.toLowerCase(),
      });

      const existingUserByExa = await this.modeUser.getByExa({
        exa: user.exa,
      });

      if (existingUserByLegajo) {
        throw new Error(`El legajo ${user.legajo} ya está registrado`);
      }

      if (existingUserByEmail) {
        throw new Error(`El email ${user.email} ya está registrado`);
      }

      if (existingUserByExa) {
        throw new Error(`El código EXA ${user.exa} ya está registrado`);
      }

      const hashedPassword = await hash(user.password_hash);

      const personaData: PersonaCreate = {
        nombre: user.nombre,
        apellido: user.apellido,
        fecha_nacimiento: user.fecha_nacimiento,
        documento: user.documento,
        email: user.email.toLowerCase(),
        telefono: user.telefono,
        tipo_documento: user.tipo_documento,
        nacionalidad: user.nacionalidad,
        genero: user.genero,
      };

      const usuarioData = {
        legajo: user.legajo,
        rol: user.rol,
        permisos: user.permisos.map((permiso: string) => permiso.toUpperCase()),
        exa: user.exa,
        password_hash: hashedPassword,
        celula: user.celula, // ✅ ACTUALIZADO
        estado: user.estado ?? "ACTIVO",
      };

      const createdUser = await this.modeUser.add({
        input: { ...personaData, ...usuarioData } as UsuarioCreate,
      });

      if (!createdUser || !createdUser.persona_id) {
        throw new Error("Error al crear el usuario - ID no generado");
      }

      const jwtSecret = Deno.env.get("JWT_SECRET");
      if (!jwtSecret) {
        throw new Error("JWT_SECRET not found");
      }

      const cryptoKey = await this.createJWTKey(jwtSecret);

      const token = await create(
        { alg: "HS256", typ: "JWT" },
        {
          id: createdUser.persona_id,
          email: createdUser.email,
          rol: createdUser.rol,
          permisos: createdUser.permisos.map((permiso: string) =>
            permiso.toUpperCase()
          ),
          legajo: createdUser.legajo,
          exa: createdUser.exa,
          exp: getNumericDate(60 * 60 * 6),
        },
        cryptoKey,
      );

      return token;
    } catch (error) {
      console.error("[ERROR] Register Service:", error);
      throw error;
    }
  }

  async getPasswordHistory(userId: string): Promise<Array<{ password_hash: string; fecha_creacion: Date; }>> {
    try {
      const passwordHistory = await this.modeUser.getPasswordHistory({
        id: userId,
      });
      return passwordHistory;
    } catch (error) {
      console.error("[ERROR] Get Password History:", error);
      throw error;
    }
  }

  async verifyToken(token: string) {
    try {
      const jwtSecret = Deno.env.get("JWT_SECRET");
      if (!jwtSecret) {
        throw new Error("JWT_SECRET not found");
      }

      const cryptoKey = await this.createJWTKey(jwtSecret);
      const payload = await verify(token, cryptoKey);

      return payload;
    } catch (error) {
      console.error("[ERROR] Token verification:", error);
      throw new Error("Token inválido");
    }
  }

  async refreshToken(oldToken: string) {
    try {
      const payload = await this.verifyToken(oldToken);

      const user = await this.modeUser.getByEmail({
        email: (payload.email as string).toLowerCase(),
      });

      if (!user) {
        throw new Error("Usuario no encontrado");
      }

      const jwtSecret = Deno.env.get("JWT_SECRET");
      if (!jwtSecret) {
        throw new Error("JWT_SECRET not found");
      }

      const cryptoKey = await this.createJWTKey(jwtSecret);

      const newToken = await create(
        { alg: "HS256", typ: "JWT" },
        {
          id: user.persona_id,
          email: user.email,
          rol: user.rol,
          permisos: user.permisos.map((permiso: string) =>
            permiso.toUpperCase()
          ),
          legajo: user.legajo,
          exa: user.exa,
          exp: getNumericDate(60 * 60 * 6),
        },
        cryptoKey,
      );

      return newToken;
    } catch (error) {
      console.error("[ERROR] Refresh token:", error);
      throw error;
    }
  }

  async changePassword(params: {
    targetUserId: string;
    authenticatedUserId: string;
    authenticatedUserRole: string;
    passwordData: CambioPassword | CambioPasswordAdmin;
  }): Promise<void> {
    try {
      const {
        targetUserId,
        authenticatedUserId,
        authenticatedUserRole,
        passwordData,
      } = params;

      const targetUser = await this.modeUser.getById({ id: targetUserId });
      if (!targetUser) {
        throw new Error(`Usuario con ID ${targetUserId} no encontrado`);
      }

      const isSelfChange = authenticatedUserId === targetUserId;
      // ✅ ACTUALIZADO: Solo BACK_OFFICE tiene permisos de admin
      const isAdmin = authenticatedUserRole === "BACK_OFFICE";

      if (!isSelfChange && !isAdmin) {
        throw new Error(
          "No tienes permisos para cambiar la contraseña de otro usuario",
        );
      }

      if (isSelfChange) {
        if (!("passwordActual" in passwordData)) {
          throw new Error("Contraseña actual requerida");
        }

        const currentPasswordHash = await this.modeUser.getPasswordHash({
          id: targetUserId,
        });

        if (!currentPasswordHash) {
          throw new Error("Error al obtener contraseña actual");
        }

        const isCurrentPasswordValid = await compare(
          passwordData.passwordActual,
          currentPasswordHash,
        );

        if (!isCurrentPasswordValid) {
          throw new Error("La contraseña actual es incorrecta");
        }
      }

      if (isSelfChange && "passwordActual" in passwordData) {
        if (passwordData.passwordActual === passwordData.passwordNueva) {
          throw new Error(
            "La nueva contraseña debe ser diferente a la contraseña actual",
          );
        }
      }

      const newPasswordHash = await hash(passwordData.passwordNueva);

      const isUsed = await this.modeUser.isPasswordUsedBefore({
        id: targetUserId,
        passwordHash: newPasswordHash,
      });

      if (isUsed) {
        throw new Error("La nueva contraseña no puede ser igual a una contraseña anterior");
      }

      const updated = await this.modeUser.updatePassword({
        id: targetUserId,
        newPasswordHash,
      });

      if (!updated) {
        throw new Error("Error al actualizar la contraseña");
      }

      console.log(
        `[INFO] 🎉 Contraseña actualizada exitosamente para usuario: ${targetUser.email}`,
      );
    } catch (error) {
      console.error("[ERROR] AuthService.changePassword:", error);
      throw error;
    }
  }
}
