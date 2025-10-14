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

      console.log("User original: ", userOriginal);

      if (!userOriginal) {
        throw new Error("Correo no encontrado");
      }

      //const hashedPassword = await hash(input.user.password);
      //console.log("Password de login: " + hashedPassword);
      //console.log("Password original: " + userOriginal.password);
      //if (hashedPassword !== userOriginal.password) {
      //  throw new Error("Password incorrecto if prueba");
      //}

      const isValidPassword = await compare(
        input.user.password,
        userOriginal.password_hash,
      );
      if (!isValidPassword) {
        throw new Error("Password incorrecto");
      }
      console.log("Password correcto :)");

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
          legajo: userOriginal.legajo,
          exa: userOriginal.exa,
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
          apellido: userOriginal.apellido,
          exa: userOriginal.exa,
          legajo: userOriginal.legajo,
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

      // ✅ CORRECCIÓN: Pasar objetos con las propiedades correctas
      const existingUserByLegajo = await this.modeUser.getByLegajo({
        legajo: user.legajo,
      });

      const existingUserByEmail = await this.modeUser.getByEmail({
        email: user.email.toLowerCase(),
      });

      const existingUserByExa = await this.modeUser.getByExa({
        exa: user.exa,
      });

      // ✅ Validar y dar mensajes específicos
      if (existingUserByLegajo) {
        throw new Error(`El legajo ${user.legajo} ya está registrado`);
      }

      if (existingUserByEmail) {
        throw new Error(`El email ${user.email} ya está registrado`);
      }

      if (existingUserByExa) {
        throw new Error(`El código EXA ${user.exa} ya está registrado`);
      }

      console.log("✅ Validaciones de unicidad pasadas");

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

      console.log("✅ Usuario creado:", createdUser.persona_id);

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
          legajo: createdUser.legajo,
          exa: createdUser.exa,
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
          id: user.persona_id,
          email: user.email,
          rol: user.rol,
          legajo: user.legajo,
          exa: user.exa,
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
