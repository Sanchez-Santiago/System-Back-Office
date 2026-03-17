// middleware/corsMiddlewares.ts
import { Request, Response, NextFunction } from 'express';
import { logger } from '../Utils/logger.ts';

export const corsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const requestOrigin = req.headers.origin;

  const isDevelopment = process.env.MODO === 'development' || process.env.MODO === 'dev';

  if (isDevelopment) {
    res.setHeader('Access-Control-Allow-Origin', requestOrigin || '*');
  } else {
    const allowedOriginsEnv = process.env.ALLOWED_ORIGINS;
    const allowedOrigins = allowedOriginsEnv
      ? allowedOriginsEnv.split(',').map((origin) => origin.trim())
      : [
          'https://tu-dominio.com',
          'https://www.tu-dominio.com',
        ];

    if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
      res.setHeader('Access-Control-Allow-Origin', requestOrigin);
    }
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie',
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  );
  res.setHeader('Access-Control-Max-Age', '86400');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  next();
};

export const timingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const ms = Date.now() - start;
    res.setHeader('X-Response-Time', `${ms}ms`);
    
    const isDevelopment = process.env.MODO === 'development';
    if (isDevelopment) {
      const method = req.method;
      const path = req.path;
      const status = res.statusCode;

      let statusIcon = '';
      if (status >= 200 && status < 300) statusIcon = '✅';
      else if (status >= 300 && status < 400) statusIcon = '↪️';
      else if (status >= 400 && status < 500) statusIcon = '⚠️';
      else if (status >= 500) statusIcon = '❌';

      logger.info(`${method} ${path} - ${statusIcon} - ${ms}ms`);
    }
  });

  next();
};

export const errorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Error no manejado:', err);

  const isDevelopment = process.env.MODO === 'development';

  let status = 500;
  let message = 'Error interno del servidor';

  if ('status' in err && typeof err.status === 'number') {
    status = err.status;
  }

  if (isDevelopment) {
    message = err.message;
  }

  res.status(status).json({
    success: false,
    message: message,
    ...(isDevelopment && {
      stack: err.stack,
      error: err.toString(),
    }),
  });
};

export const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const isDevelopment = process.env.MODO === 'development';

  if (isDevelopment) {
    const method = req.method;
    const path = req.path;
    const timestamp = new Date().toISOString();

    logger.info(`${method} ${path}`);
  }

  next();
};
