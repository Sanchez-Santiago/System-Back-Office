// BackEnd/src/middleware/errorHandlingMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { ServiceDegradedError } from '../types/errors.ts';
import { logger } from '../Utils/logger.ts';

export function handleServiceDegradedError(error: Error, res: Response): boolean {
  if (error instanceof ServiceDegradedError) {
    res.status(503).json({
      success: false,
      message: 'Servicio temporalmente no disponible',
      error: 'SERVICE_DEGRADED',
      details: error.message,
      timestamp: new Date().toISOString(),
      retryAfter: 30,
    });
    
    logger.warn(`Service degraded response: ${error.message}`);
    return true;
  }
  
  return false;
}

export function handleConnectionError(error: Error, res: Response): boolean {
  if (error.name === 'ConnectionUnavailableError' || 
      error.name === 'ConnectionTimeoutError') {
    res.status(503).json({
      success: false,
      message: 'Base de datos no disponible',
      error: 'DATABASE_UNAVAILABLE',
      details: error.message,
      timestamp: new Date().toISOString(),
      retryAfter: 60,
    });
    
    logger.error(`Database connection error: ${error.message}`);
    return true;
  }
  
  return false;
}

export const errorHandlerMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (handleServiceDegradedError(err, res)) return;
  if (handleConnectionError(err, res)) return;
  
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: 'INTERNAL_ERROR',
    details: err.message,
    timestamp: new Date().toISOString(),
  });
  
  logger.error(`Unhandled error: ${err.message}`, { stack: err.stack });
};

export function withErrorHandling<T extends any[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await handler(...args);
    } catch (error) {
      throw error;
    }
  };
}
