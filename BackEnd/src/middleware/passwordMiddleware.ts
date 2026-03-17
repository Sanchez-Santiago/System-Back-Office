// Middleware de validación de historial de contraseñas
import { Request, Response, NextFunction } from 'express';
import type { UserModelDB } from '../interface/Usuario.ts';
import { logger } from '../Utils/logger.ts';

export const validateActivePasswordMiddleware = (model: UserModelDB) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as { id: string };

    if (!user || !user.id) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
      });
      return;
    }

    try {
      const passwordHash = await model.getPasswordHash({ id: user.id });

      if (!passwordHash) {
        res.status(403).json({
          success: false,
          message: 'Usuario sin contraseña activa. Por favor, contacta al administrador.',
        });
        return;
      }

      next();
    } catch (error) {
      logger.error('Error validando contraseña activa:', error);
      res.status(500).json({
        success: false,
        message: 'Error al validar credenciales',
      });
    }
  };
};

export const preventOldPasswordAccessMiddleware = (model: UserModelDB) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as { id: string };

    if (!user || !user.id) {
      next();
      return;
    }

    try {
      const token = req.cookies?.token || req.headers.authorization?.substring(7);

      if (!token) {
        next();
        return;
      }

      const activePasswordHash = await model.getPasswordHash({ id: user.id });

      if (!activePasswordHash) {
        res.status(401).json({
          success: false,
          message: 'Sesión inválida. Por favor, inicia sesión nuevamente.',
        });
        return;
      }

      next();
    } catch (error) {
      logger.error('Error verificando contraseña activa:', error);
      next();
    }
  };
};
