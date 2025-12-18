// ============================================
// BackEnd/src/middleware/rolMiddlewares.ts (COMPLETO ACTUALIZADO)
// ============================================
import { Middleware } from "oak";

/**
 * Middleware de verificación de roles
 * ✅ ACTUALIZADO: Funciona con VENDEDOR, SUPERVISOR, BACK_OFFICE
 */
export function rolMiddleware(...rolesPermitidos: string[]): Middleware {
  return async (ctx, next) => {
    const user = ctx.state.permisos;

    if (!user) {
      ctx.response.status = 401;
      ctx.response.body = {
        success: false,
        message: "Usuario no autenticado",
      };
      return;
    }

    if (!user.rol) {
      ctx.response.status = 403;
      ctx.response.body = {
        success: false,
        message: "Usuario sin rol asignado",
      };
      return;
    }

    const userRole = user.permisos.map((permiso) => permiso.toUpperCase());

    if (!rolesPermitidos.includes(userRole)) {
      ctx.response.status = 403;
      ctx.response.body = {
        success: false,
        message: `Acceso denegado. Se requiere uno de los siguientes roles: ${
          rolesPermitidos.join(", ")
        }`,
        userRole: userRole,
      };
      return;
    }

    await next();
  };
}
