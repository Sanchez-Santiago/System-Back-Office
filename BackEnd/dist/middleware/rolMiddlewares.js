export function rolMiddleware(...rolesPermitidos) {
    return (req, res, next) => {
        const user = req.user;
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
            const userPermisos = user.permisos?.map((p) => p.toUpperCase()) || [];
            const hasPermission = rolesPermitidos.some((rol) => userPermisos.includes(rol));
            if (!hasPermission) {
                res.status(403).json({
                    success: false,
                    message: `Acceso denegado. Se requiere uno de los siguientes roles: ${rolesPermitidos.join(', ')}`,
                    userRole: userRole,
                    userPermisos: userPermisos,
                });
                return;
            }
        }
        next();
    };
}
//# sourceMappingURL=rolMiddlewares.js.map