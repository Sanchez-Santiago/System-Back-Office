export interface PostgreSQLTestResult {
    success: boolean;
    message: string;
    details?: any;
    timestamp: string;
}
export interface CriticalTablesResult {
    success: boolean;
    message: string;
    details?: {
        checkedCount?: number;
        totalTables?: number;
        missingTables?: string[];
        existingTables?: string[];
    };
    timestamp: string;
}
export declare function createPostgreSQLTesterFromEnv(): {
    /**
     * Prueba básica de conexión a PostgreSQL
     */
    testConnection(options?: {
        timeout?: number;
    }): Promise<PostgreSQLTestResult>;
    /**
     * Prueba de conexión a Supabase
     */
    testSupabaseConnection(): Promise<PostgreSQLTestResult>;
    /**
     * Prueba completa de conexión (PostgreSQL + Supabase)
     */
    testFullConnection(options?: {
        timeout?: number;
        retries?: number;
        retryDelay?: number;
    }): Promise<PostgreSQLTestResult>;
    /**
     * Verifica tablas críticas de la aplicación
     */
    checkCriticalTables(tables: string[]): Promise<CriticalTablesResult>;
    /**
     * Formatea resultados para logging
     */
    formatResult(result: PostgreSQLTestResult | CriticalTablesResult): string;
    /**
     * Compara configuración con variables esperadas
     */
    validateEnvironment(): PostgreSQLTestResult;
};
//# sourceMappingURL=PostgreSQLTest.d.ts.map