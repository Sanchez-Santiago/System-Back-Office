/// ============================================
// BackEnd/src/middleware/rolMiddlewares.ts (COMPLETO)
// ============================================

/**
 * Middleware de verificación de roles
 * ✅ ACTUALIZADO: Funciona con VENDEDOR, SUPERVISOR, BACK_OFFICE
 */
export function rolMiddleware(...rolesPermitidos: string[]): Middleware {
  return async (ctx, next) => {
    const user = ctx.state.user;

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

    const userRole = user.rol.toUpperCase();

    // Verificar si el rol del usuario está en los roles permitidos
    if (!rolesPermitidos.includes(userRole)) {
      // También verificar por permisos
      const userPermisos = user.permisos?.map((p: string) => p.toUpperCase()) || [];
      const hasPermission = rolesPermitidos.some((rol) => userPermisos.includes(rol));

      if (!hasPermission) {
        ctx.response.status = 403;
        ctx.response.body = {
          success: false,
          message: `Acceso denegado. Se requiere uno de los siguientes roles: ${
            rolesPermitidos.join(", ")
          }`,
          userRole: userRole,
          userPermisos: userPermisos,
        };
        return;
      }
    }

    await next();
  };
}
