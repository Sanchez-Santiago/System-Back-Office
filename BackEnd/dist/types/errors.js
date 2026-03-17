// ============================================
// BackEnd/src/types/errors.ts
// ============================================
/**
 * Error personalizado para servicios en modo degradado
 * Se lanza cuando el sistema está funcionando pero sin conexión a la base de datos
 */
export class ServiceDegradedError extends Error {
    constructor(message = "Servicio en modo degradado - sin conexión a base de datos") {
        super(message);
        this.name = "ServiceDegradedError";
    }
}
/**
 * Error personalizado para conexión no disponible
 * Se lanza cuando no hay conexión a la base de datos
 */
export class ConnectionUnavailableError extends Error {
    constructor(message = "Conexión a base de datos no disponible") {
        super(message);
        this.name = "ConnectionUnavailableError";
    }
}
/**
 * Error personalizado para timeouts de conexión
 */
export class ConnectionTimeoutError extends Error {
    constructor(message = "Timeout de conexión a base de datos") {
        super(message);
        this.name = "ConnectionTimeoutError";
    }
}
//# sourceMappingURL=errors.js.map