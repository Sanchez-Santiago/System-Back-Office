import { jwtVerify } from 'jose';
import { createSecretKey } from 'crypto';
import 'dotenv/config';
import { logger } from '../Utils/logger.ts';
export const authMiddleware = (model) => {
    return async (req, res, next) => {
        try {
            let token = req.cookies?.token || req.headers.authorization?.substring(7);
            if (!token) {
                res.status(401).json({
                    success: false,
                    message: 'No autorizado: token no presente',
                });
                return;
            }
            const secret = process.env.JWT_SECRET;
            if (!secret) {
                logger.error('JWT_SECRET no definido en las variables de entorno');
                res.status(500).json({
                    success: false,
                    message: 'Error de configuración del servidor',
                });
                return;
            }
            const key = createSecretKey(Buffer.from(secret));
            const { payload } = await jwtVerify(token, key);
            if (!payload) {
                res.status(401).json({
                    success: false,
                    message: 'Token inválido',
                });
                return;
            }
            const user = await model.getById({ id: payload.id });
            if (!user) {
                res.status(401).json({
                    success: false,
                    message: 'Usuario no encontrado en la base de datos',
                });
                return;
            }
            req.user = { ...user, id: user.persona_id };
            if (process.env.MODO === 'development') {
                logger.info('Usuario autenticado:', {
                    id: user.persona_id,
                    email: user.email,
                    rol: user.rol,
                    legajo: user.legajo,
                });
            }
            next();
        }
        catch (error) {
            logger.error('Error en authMiddleware:', error);
            res.status(401).json({
                success: false,
                message: 'Token inválido o expirado',
            });
        }
    };
};
//# sourceMappingURL=authMiddlewares.js.map