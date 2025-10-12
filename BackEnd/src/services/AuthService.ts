import { UsuarioCreate, UsuarioLogin } from "../schemas/persona/User.ts";
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

  // Crear CryptoKey a partir del JWT_SECRET
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

      const isValidPassword = await compare(
        input.user.password,
        userOriginal.password,
      );
      if (!isValidPassword) {
        throw new Error("Password incorrecto");
      }

      const jwtSecret = Deno.env.get("JWT_SECRET");
      if (!jwtSecret) {
        throw new Error("JWT_SECRET not found");
      }

      const cryptoKey = await this.createJWTKey(jwtSecret);

      const token = await create(
        { alg: "HS256", typ: "JWT" },
        {
          id: userOriginal.id,
          email: userOriginal.email,
          name: userOriginal.name,
          rol: userOriginal.role,
          exp: getNumericDate(60 * 60 * 24),
        },
        cryptoKey,
      );

      return {
        token,
        user: {
          id: userOriginal.id,
          email: userOriginal.email,
          name: userOriginal.name,
          rol: userOriginal.role,
        },
      };
    } catch (error) {
      console.error("[ERROR] Login:", error);
      throw error;
    }
  }

  // services/AuthService.ts - método register (línea ~135-145)
  async register(input: { user: UsuarioCreate }) {
    try {
      if (!input || !input.user) {
        throw new Error("Datos de usuario no proporcionados");
      }

      const user = input.user;

      if (!user.password_hash || user.password_hash.length < 6) {
        throw new Error("Password inválido (mínimo 6 caracteres)");
      }

      const existingUser = await this.modeUser.getByLegajo(
        user.legajo,
      );

      if (existingUser) {
        throw new Error("El usuario ya existe");
      }

      const hashedPassword = await hash(user.password_hash);

      const personaData: PersonaCreate = {
        nombre: user.nombre,
        apellido: user.apellido,
        fecha_nacimiento: user.fecha_nacimiento,
        documento: user.documento,
        email: user.email.toLowerCase(),
        telefono: user.telefono ?? null,
        tipo_documento: user.tipo_documento,
        nacionalidad: user.nacionalidad,
        genero: user.genero ?? null,
      };

      const usuarioData = {
        legajo: user.legajo,
        rol: user.rol,
        exa: user.exa,
        password_hash: hashedPassword,
        empresa_id_empresa: user.empresa_id_empresa,
        estado: user.estado ?? "ACTIVO",
      };

      const createdUser = await this.modeUser.add({
        input: { ...personaData, ...usuarioData },
      });

      console.log("✅ Usuario creado:", createdUser);

      // ✅ CORRECCIÓN: Verificar persona_id en lugar de id
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
          id: createdUser.persona_id, // ✅ Usar persona_id
          email: createdUser.email,
          role: createdUser.rol, // ✅ Usar 'rol' en lugar de 'role'
          nombre: createdUser.nombre,
          apellido: createdUser.apellido,
          exp: getNumericDate(60 * 60 * 24),
        },
        cryptoKey,
      );

      console.log("✅ Token generado exitosamente");

      return token;
    } catch (error) {
      console.error("[ERROR] Register Service:", error);
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

      // Verificar que el usuario aún existe
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
          id: user.id,
          email: user.email,
          role: user.role,
          exp: getNumericDate(60 * 60 * 24),
        },
        cryptoKey,
      );

      return newToken;
    } catch (error) {
      console.error("[ERROR] Refresh token:", error);
      throw error;
    }
  }
}
