// routes/auth.ts
import { Router } from "oak";
import { config } from "dotenv";
import { AuthController } from "../Controller/AuthController.ts";
import { UserModelDB } from "../interface/Usuario.ts";
import { UsuarioCreateSchema, UsuarioLogin } from "../schemas/persona/User.ts";
import { authMiddleware } from "../middleware/authMiddlewares.ts";
import { rolMiddleware } from "../middleware/rolMiddlewares.ts";

config({ export: true });

export function authRouter(userModel: UserModelDB) {
  const router = new Router();
  const authController = new AuthController(userModel);

  // POST /login
  router.post("/usuario/login", async (ctx) => {
    try {
      const body = ctx.request.body.json();
      const input = await body;
      const email = input.user.email.toLowerCase();
      const password = input.user.password;
      const user: UsuarioLogin = {
        email,
        password,
      };
      if (!email || !password) throw new Error("Email y contraseña requeridos");

      const newToken = await authController.login({ user });

      if (Deno.env.get("MODO") === "production") {
        await ctx.cookies.set("token", newToken.token, {
          httpOnly: true,
          secure: true, // solo por HTTPS
          sameSite: "strict",
        });

        ctx.response.status = 200;
        ctx.response.body = { Res: "Token new OK" };
      } else if (Deno.env.get("MODO") === "development") {
        await ctx.cookies.set("token", newToken.token, {
          httpOnly: true,
          secure: false, // solo por HTTPS
          sameSite: "strict",
        });
        ctx.response.status = 200;
        ctx.response.body = { success: true, data: newToken };
      }
    } catch (error) {
      ctx.response.status = 401;
      ctx.response.body = {
        success: false,
        message: error instanceof Error ? error.message : String(error),
      };
    }
  });

  // POST /register
  router.post(
    "/usuario/register",
    authMiddleware(userModel),
    rolMiddleware("ADMINISTRADOR", "SUPERADMINISTRADOR"),
    async (ctx) => {
      try {
        const body = ctx.request.body.json();
        const input = await body;

        // ✅ Consistente con /login que usa input.user
        if (!input || !input.user) {
          throw new Error("Datos de usuario inválidos");
        }

        const userData = input.user;

        // Validar con Zod
        const result = UsuarioCreateSchema.safeParse({
          nombre: userData.nombre.toUpperCase(),
          apellido: userData.apellido.toUpperCase(),
          fecha_nacimiento: userData.fecha_nacimiento,
          documento: userData.documento.toUpperCase(),
          email: userData.email.toLowerCase(),
          telefono: userData.telefono ?? null,
          tipo_documento: userData.tipo_documento.toUpperCase(),
          nacionalidad: userData.nacionalidad.toUpperCase(),
          legajo: userData.legajo,
          rol: userData.rol,
          exa: userData.exa.toUpperCase(),
          password_hash: userData.password,
          empresa_id_empresa: Number(userData.empresa_id_empresa),
          estado: userData.estado ?? "ACTIVO",
        });

        if (!result.success) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "Datos de validación inválidos",
            errors: result.error.errors,
          };
          return;
        }

        const newToken = await authController.register({ user: result.data });

        const isProduction = Deno.env.get("MODO") === "production";

        await ctx.cookies.set("token", newToken, {
          httpOnly: true,
          secure: isProduction,
          sameSite: "strict",
        });

        ctx.response.status = 201;
        ctx.response.body = isProduction
          ? { Res: "Token new OK" }
          : { success: true, token: newToken };
      } catch (error) {
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          message: error instanceof Error ? error.message : String(error),
        };
      }
    },
  );

  // GET /verify
  router.get("/usuario/verify", async (ctx) => {
    try {
      const token = ctx.request.headers.get("Authorization")?.replace(
        "Bearer ",
        "",
      );
      if (!token) throw new Error("Token requerido");

      const payload = await authController.verifyToken(token);
      ctx.response.status = 200;
      ctx.response.body = { success: true, payload };
    } catch (error) {
      ctx.response.status = 401;
      ctx.response.body = {
        success: false,
        message: error instanceof Error ? error.message : String(error),
      };
    }
  });

  // POST /refresh
  router.post("/usuario/refresh", async (ctx) => {
    try {
      const token = await ctx.cookies.get("token"); // 🔑 Leer cookie directamente
      if (!token) {
        ctx.response.status = 401;
        ctx.response.body = { error: "No autorizado" };
        return;
      }

      const newToken = await authController.refreshToken(token);

      // Opcional: actualizar cookie con el nuevo token
      if (Deno.env.get("MODO") === "production") {
        await ctx.cookies.set("token", newToken, {
          httpOnly: true,
          secure: true, // solo por HTTPS
          sameSite: "strict",
        });
        ctx.response.status = 200;
        ctx.response.body = { Res: "Token new OK" };
      } else if (Deno.env.get("MODO") === "development") {
        await ctx.cookies.set("token", newToken, {
          httpOnly: true,
          secure: false, // solo por HTTPS
          sameSite: "strict",
        });
        ctx.response.status = 200;
        ctx.response.body = { success: true, token: newToken };
      }
    } catch (error) {
      ctx.response.status = 401;
      ctx.response.body = {
        success: false,
        message: error instanceof Error ? error.message : String(error),
      };
    }
  });

  return router;
}
