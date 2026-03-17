import { ServiceDegradedError } from '../types/errors.ts';
import { logger } from '../Utils/logger.ts';
export function handleServiceDegradedError(error, res) {
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
export function handleConnectionError(error, res) {
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
export const errorHandlerMiddleware = (err, req, res, next) => {
    if (handleServiceDegradedError(err, res))
        return;
    if (handleConnectionError(err, res))
        return;
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_ERROR',
        details: err.message,
        timestamp: new Date().toISOString(),
    });
    logger.error(`Unhandled error: ${err.message}`, { stack: err.stack });
};
export function withErrorHandling(handler) {
    return async (...args) => {
        try {
            return await handler(...args);
        }
        catch (error) {
            throw error;
        }
    };
}
//# sourceMappingURL=errorHandlingMiddleware.js.map