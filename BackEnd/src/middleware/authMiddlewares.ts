// middleware/authMiddleware.ts
import { Middleware } from "oak";
import { verify } from "djwt";
import { config } from "dotenv";
import type { UserModelDB } from "../interface/Usuario.ts";
import { AuthController } from "../Controller/AuthController.ts";

config({ export: true });

/**
 * Middleware de autenticación JWT
 *
 * Verifica que:
 * - El token existe en las cookies
 * - El token es válido y no ha expirado
 * - El usuario existe en la base de datos
 *
 * Si la autenticación es exitosa, agrega el usuario a ctx.state.user
 *
 * @param {UserModelDB} model - Modelo de base de datos para usuarios
 * @returns {Middleware} Middleware de Oak para autenticación
 *
 * @example
 * router.get("/protected", authMiddleware(userModel), async (ctx) => {
 *   const user = ctx.state.user; // Usuario autenticado
 * });
 */
export const authMiddleware = (model: UserModelDB): Middleware => {
  return async (ctx, next) => {
    const authController = new AuthController(model);

    try {
      // 1. Buscar token en cookies
      const token = await ctx.cookies.get("token");

      if (!token) {
        ctx.response.status = 401;
        ctx.response.body = {
          success: false,
          message: "No autorizado: token no presente",
        };
        return; // ✅ Detener ejecución
      }

      // 2. Cargar clave secreta desde variables de entorno
      const secret = Deno.env.get("JWT_SECRET");

      if (!secret) {
        console.error("❌ JWT_SECRET no definido en las variables de entorno");
        ctx.response.status = 500;
        ctx.response.body = {
          success: false,
          message: "Error de configuración del servidor",
        };
        return; // ✅ Detener ejecución
      }

      // 3. Crear CryptoKey para validación
      const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["verify"],
      );

      // 4. Validar firma y expiración del token
      const payload = await verify(token, key);

      // Verificar que el payload existe (verify lanza error si falla)
      if (!payload) {
        ctx.response.status = 401;
        ctx.response.body = {
          success: false,
          message: "Token inválido",
        };
        return; // ✅ Detener ejecución
      }

      // 5. Verificar que el usuario existe en la base de datos
      const user = await authController.verifyToken(token);

      if (!user) {
        ctx.response.status = 401;
        ctx.response.body = {
          success: false,
          message: "Usuario no válido o no encontrado",
        };
        return; // ✅ Detener ejecución
      }

      // 6. Guardar usuario en el contexto para uso en handlers siguientes
      //console.log("User:", user);
      ctx.state.user = user;

      // Log para debug (solo en desarrollo)
      if (Deno.env.get("MODO") === "development") {
        console.log("✅ Usuario autenticado:", {
          id: user.id,
          email: user.email,
          role: user.role || user.rol,
          legajo: user.legajo,
          exa: user.exa,
        });
      }

      // 7. ✅ Continuar con el siguiente middleware/handler
      await next();
    } catch (error) {
      // Capturar errores de verificación de JWT o problemas de base de datos
      console.error("❌ Error en authMiddleware:", error);

      ctx.response.status = 401;
      ctx.response.body = {
        success: false,
        message: "Token inválido o expirado",
      };

      // ✅ CRÍTICO: Retornar explícitamente después de enviar respuesta
      return;
    }
  };
};
