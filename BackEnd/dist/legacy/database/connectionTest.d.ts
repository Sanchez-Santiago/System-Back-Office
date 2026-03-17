/**
 * Módulo específico para pruebas de conexión con MySQL
 * Utiliza las utilidades genéricas para implementar pruebas específicas
 * de base de datos MySQL para el proyecto System Back-Office
 */
import { ConnectionTestResult, ConnectionTestOptions } from "../../Utils/connectionTester.ts";
export interface MySQLConnectionConfig {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
}
export interface MySQLTestResult extends ConnectionTestResult {
    databaseInfo?: {
        version: string;
        currentDatabase: string;
        tablesCount: number;
    };
    connectionConfig?: {
        host: string;
        port: number;
        username: string;
        database: string;
    };
}
export declare class MySQLConnectionTester {
    private config;
    constructor(config: MySQLConnectionConfig);
    /**
     * Realiza una prueba completa de conexión a MySQL
     * Incluye pruebas de red, autenticación y acceso a base de datos
     */
    testFullConnection(options?: ConnectionTestOptions): Promise<MySQLTestResult>;
    /**
     * Prueba la conectividad de red al servidor MySQL
     */
    private testNetworkConnection;
    /**
     * Prueba la autenticación con el servidor MySQL
     */
    private testAuthentication;
    /**
     * Prueba el acceso a la base de datos específica y ejecuta consultas de prueba
     */
    private testDatabaseAccess;
    /**
     * Verifica la existencia de tablas críticas para la aplicación
     */
    checkCriticalTables(criticalTables: string[]): Promise<ConnectionTestResult>;
    /**
     * Obtiene un resumen de la configuración (sin incluir contraseña)
     */
    private getConfigSummary;
    /**
     * Formatea el resultado completo para logging
     */
    formatResult(result: MySQLTestResult): string;
}
/**
 * Función de conveniencia para crear un tester a partir de variables de entorno
 */
export declare function createMySQLTesterFromEnv(): MySQLConnectionTester;
//# sourceMappingURL=connectionTest.d.ts.map