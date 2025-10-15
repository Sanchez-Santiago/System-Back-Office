// middlewares/authMiddleware.ts
import { Middleware } from "oak";
import { verify } from "djwt";
import { config } from "dotenv";
import type { UserModelDB } from "../interface/Usuario.ts";
import { AuthController } from "../Controller/AuthController.ts";

config({ export: true });

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
        return;
      }

      // 2. Cargar clave secreta desde variables de entorno
      const secret = Deno.env.get("JWT_SECRET");
      if (!secret) {
        console.error("❌ JWT_SECRET no definido");
        throw new Error("JWT_SECRET no definido");
      }

      const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["verify"],
      );

      // 3. Validar firma y expiración
      const payload = await verify(token, key);
      if (!payload) {
        ctx.response.status = 401;
        ctx.response.body = {
          success: false,
          message: "Token inválido",
        };
        return;
      }

      // 4. Verificar usuario en la base de datos
      const user = await authController.verifyToken(token);

      if (!user) {
        ctx.response.status = 401;
        ctx.response.body = {
          success: false,
          message: "Usuario no válido o no encontrado",
        };
        return;
      }

      // 5. Guardar usuario en el contexto
      ctx.state.user = user;

      // Log para debug (solo en desarrollo)
      if (Deno.env.get("MODO") === "development") {
        console.log("✅ Usuario autenticado:", {
          id: user.id,
          email: user.email,
          role: user.role || user.rol,
        });
      }

      // 6. Continuar con la request
      await next();
    } catch (error) {
      ctx.response.status = 401;
      ctx.response.body = {
        success: false,
        message: "Token inválido o expirado",
      };

      if (Deno.env.get("MODO") === "development") {
        console.error("❌ Error en authMiddleware:", error);
      }
    }
  };
};
