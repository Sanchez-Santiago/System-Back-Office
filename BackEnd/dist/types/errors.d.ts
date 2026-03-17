/**
 * Error personalizado para servicios en modo degradado
 * Se lanza cuando el sistema está funcionando pero sin conexión a la base de datos
 */
export declare class ServiceDegradedError extends Error {
    constructor(message?: string);
}
/**
 * Error personalizado para conexión no disponible
 * Se lanza cuando no hay conexión a la base de datos
 */
export declare class ConnectionUnavailableError extends Error {
    constructor(message?: string);
}
/**
 * Error personalizado para timeouts de conexión
 */
export declare class ConnectionTimeoutError extends Error {
    constructor(message?: string);
}
//# sourceMappingURL=errors.d.ts.map