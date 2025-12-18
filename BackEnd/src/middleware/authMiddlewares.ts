// ============================================
// BackEnd/src/middleware/authMiddlewares.ts
// ============================================
import { Middleware } from "oak";
import { verify } from "djwt";
import { config } from "dotenv";
import type { UserModelDB } from "../interface/Usuario.ts";
import { AuthController } from "../Controller/AuthController.ts";

config({ export: true });

/**
 * Middleware de autenticación JWT
 * ✅ Sin cambios - funciona correctamente con el nuevo sistema
 */
export const authMiddleware = (model: UserModelDB): Middleware => {
  return async (ctx, next) => {
    const authController = new AuthController(model);

    try {
      const token = await ctx.cookies.get("token");

      if (!token) {
        ctx.response.status = 401;
        ctx.response.body = {
          success: false,
          message: "No autorizado: token no presente",
        };
        return;
      }

      const secret = Deno.env.get("JWT_SECRET");

      if (!secret) {
        console.error("❌ JWT_SECRET no definido en las variables de entorno");
        ctx.response.status = 500;
        ctx.response.body = {
          success: false,
          message: "Error de configuración del servidor",
        };
        return;
      }

      const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["verify"],
      );

      const payload = await verify(token, key);

      if (!payload) {
        ctx.response.status = 401;
        ctx.response.body = {
          success: false,
          message: "Token inválido",
        };
        return;
      }

      const user = await authController.verifyToken(token);

      if (!user) {
        ctx.response.status = 401;
        ctx.response.body = {
          success: false,
          message: "Usuario no válido o no encontrado",
        };
        return;
      }

      ctx.state.user = user;

      if (Deno.env.get("MODO") === "development") {
        console.log("✅ Usuario autenticado:", {
          id: user.id,
          email: user.email,
          rol: user.rol,
          legajo: user.legajo,
          exa: user.exa,
        });
      }

      await next();
    } catch (error) {
      console.error("❌ Error en authMiddleware:", error);

      ctx.response.status = 401;
      ctx.response.body = {
        success: false,
        message: "Token inválido o expirado",
      };

      return;
    }
  };
};
