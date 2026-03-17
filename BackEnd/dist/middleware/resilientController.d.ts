/**
 * Base para controladores con manejo resiliente de errores
 * Proporciona métodos estáticos para manejar errores de servicio degradado
 */
export declare abstract class ResilientController {
    /**
     * Wrapper para métodos de controladores que maneja errores de servicio degradado
     * @param methodName Nombre del método para logging
     * @param handler Función del controlador a ejecutar
     * @returns Resultado del handler o lanza error apropiado
     */
    static withResilientHandling<T>(methodName: string, handler: () => Promise<T>): Promise<T>;
    /**
     * Verifica si el sistema está en modo degradado
     * @returns true si hay problemas de conexión
     */
    static isSystemDegraded(error: any): boolean;
    /**
     * Crea una respuesta degradada estándar
     * @param operation Operación que falló
     * @param details Detalles adicionales
     * @returns Objeto de respuesta degradada
     */
    static createDegradedResponse(operation: string, details?: string): {
        success: boolean;
        message: string;
        error: string;
        details: string;
        timestamp: string;
        retryAfter: number;
        data: null;
    };
    /**
     * Wrapper para métodos GET que pueden retornar datos vacíos en modo degradado
     */
    static getWithFallback<T>(operation: string, handler: () => Promise<T>, fallbackValue: T): Promise<T>;
}
/**
 * Helper para decorar métodos de controladores con manejo resiliente
 */
export declare function resilient(methodName?: string): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
//# sourceMappingURL=resilientController.d.ts.map