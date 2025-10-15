// middlewares/roleMiddleware.ts
import { Middleware } from "oak";

export function rolMiddleware(...rolesPermitidos: string[]): Middleware {
  return async (ctx, next) => {
    const user = ctx.state.user;

    // Verificar que el usuario existe
    if (!user) {
      ctx.response.status = 401;
      ctx.response.body = {
        success: false,
        message: "Usuario no autenticado",
      };
      return;
    }

    // Verificar que tiene rol
    if (!user.role && !user.rol) {
      ctx.response.status = 403;
      ctx.response.body = {
        success: false,
        message: "Usuario sin rol asignado",
      };
      return;
    }

    // Obtener el rol (puede venir como 'role' o 'rol')
    const userRole = user.role || user.rol;

    // Verificar que el rol está permitido
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

    // Todo OK, continuar
    await next();
  };
}
