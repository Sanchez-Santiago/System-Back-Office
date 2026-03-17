/**
 * Utilidades genéricas para pruebas de conexión
 * Proporciona funciones reutilizables para testear conectividad
 * con diferentes tipos de servicios y bases de datos
 */
export interface ConnectionTestResult {
    success: boolean;
    message: string;
    error?: Error;
    duration: number;
    timestamp: string;
    details?: Record<string, unknown>;
}
export interface ConnectionTestOptions {
    timeout?: number;
    retries?: number;
    retryDelay?: number;
    verbose?: boolean;
}
export declare enum ConnectionErrorType {
    NETWORK = "NETWORK",
    AUTHENTICATION = "AUTHENTICATION",
    DATABASE_NOT_FOUND = "DATABASE_NOT_FOUND",
    TIMEOUT = "TIMEOUT",
    UNKNOWN = "UNKNOWN"
}
/**
 * Realiza una prueba de conexión TCP a un host y puerto específicos
 */
export declare function testTcpConnection(host: string, port: number, options?: ConnectionTestOptions): Promise<ConnectionTestResult>;
/**
 * Identifica el tipo de error basado en el mensaje de error
 */
export declare function identifyErrorType(error: unknown): ConnectionErrorType;
/**
 * Implementa retry con delay exponencial
 */
export declare function retryWithBackoff<T>(operation: () => Promise<T>, options?: ConnectionTestOptions): Promise<T>;
/**
 * Genera un mensaje de sugerencia basado en el tipo de error
 */
export declare function getSuggestionMessage(errorType: ConnectionErrorType): string;
/**
 * Formatea el resultado de una prueba de conexión para logging
 */
export declare function formatConnectionTestResult(result: ConnectionTestResult): string;
//# sourceMappingURL=connectionTester.d.ts.map