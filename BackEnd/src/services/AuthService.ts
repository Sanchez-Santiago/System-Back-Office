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

      // Esto asume que userOriginal.password está hasheado con bcrypt
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

      // Crear CryptoKey correctamente para JWT
      const cryptoKey = await this.createJWTKey(jwtSecret);

      const token = await create(
        { alg: "HS256", typ: "JWT" },
        {
          id: userOriginal.id,
          email: userOriginal.email,
          name: userOriginal.name,
          rol: userOriginal.role,
          exp: getNumericDate(60 * 60 * 24), // 1 día de validez
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
      console.error(error);
      throw error;
    }
  }

  // Método adicional para registro de usuarios
  async register(input: { user: UsuarioCreate }) {
    try {
      const user = input.user;
      // Verificar si el usuario ya existe
      const existingUser = await this.modeUser.getById(input.user.id);
      if (existingUser) {
        throw new Error("El usuario ya existe");
      }

      // ✅ Hashear la contraseña antes de guardarla
      if (!input.user.password || input.user.password.length < 6) {
        throw new Error("Password inválido");
      }

      const hashedPassword = await hash(input.user.password);
      // Crear usuario con contraseña hasheada
      // 🧱 Crear datos para tabla persona
      const personaData: PersonaCreate = {
        nombre: user.nombre,
        apellido: user.apellido,
        fecha_nacimiento: user.fecha_nacimiento,
        documento: user.documento,
        email: user.email,
        telefono: user.telefono || null,
        tipo_documento: user.tipo_documento,
        nacionalidad: user.nacionalidad,
        genero: user.genero || null,
      };

      // 🧍‍♂️ Crear datos para tabla usuario
      const usuarioData = {
        legajo: user.legajo,
        rol: user.rol || "VENDEDOR", // o el que definas por defecto
        exa: user.exa,
        password_hash: hashedPassword,
        empresa_id_empresa: user.empresa_id_empresa,
        estado: user.estado || "ACTIVO",
      };

      const createdUser = await this.modeUser.add({
        input: { ...personaData, ...usuarioData },
      });
      if (!createdUser) {
        throw new Error("Error al crear el usuario");
      }

      const jwtSecret = Deno.env.get("JWT_SECRET");
      if (!jwtSecret) {
        throw new Error("JWT_SECRET not found");
      }

      // ✅ CORRECCIÓN: Crear CryptoKey correctamente para JWT
      const cryptoKey = await this.createJWTKey(jwtSecret);

      // ✅ CORRECCIÓN DE SEGURIDAD: No incluir password en el token
      const token = await create(
        { alg: "HS256", typ: "JWT" },
        {
          id: createdUser.id,
          email: createdUser.email,
          role: createdUser.role,
          exp: getNumericDate(60 * 60 * 24), // 1 día de validez
        },
        cryptoKey,
      );
      return token;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // Método para verificar tokens JWT
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
      console.error("Token verification failed:", error);
      throw new Error("Token inválido");
    }
  }

  // Método para refrescar token
  async refreshToken(oldToken: string) {
    try {
      const payload = await this.verifyToken(oldToken);

      // Verificar que el usuario aún existe
      const user = await this.modeUser.getByEmail({
        email: payload.email as string,
      });
      if (!user) {
        throw new Error("Usuario no encontrado");
      }

      const jwtSecret = Deno.env.get("JWT_SECRET");
      if (!jwtSecret) {
        throw new Error("JWT_SECRET not found");
      }

      const cryptoKey = await this.createJWTKey(jwtSecret);

      // Crear nuevo token
      const newToken = await create(
        { alg: "HS256", typ: "JWT" },
        {
          id: user.id,
          email: user.email,
          role: user.role,
          exp: getNumericDate(60 * 60 * 24), // 1 día
        },
        cryptoKey,
      );

      return newToken;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
