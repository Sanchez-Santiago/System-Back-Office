// BackEnd/src/middleware/rolMiddlewares.ts
import { Request, Response, NextFunction } from 'express';

export function rolMiddleware(...rolesPermitidos: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as { id: string; rol: string; permisos: string[] };

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
      });
      return;
    }

    if (!user.rol) {
      res.status(403).json({
        success: false,
        message: 'Usuario sin rol asignado',
      });
      return;
    }

    const userRole = user.rol.toUpperCase();

    if (!rolesPermitidos.includes(userRole)) {
      const userPermisos = user.permisos?.map((p: string) => p.toUpperCase()) || [];
      const hasPermission = rolesPermitidos.some((rol) => userPermisos.includes(rol));

      if (!hasPermission) {
        res.status(403).json({
          success: false,
          message: `Acceso denegado. Se requiere uno de los siguientes roles: ${
            rolesPermitidos.join(', ')
          }`,
          userRole: userRole,
          userPermisos: userPermisos,
        });
        return;
      }
    }

    next();
  };
}
