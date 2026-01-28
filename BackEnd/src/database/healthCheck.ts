/**
 * Módulo de Health Check para el sistema System Back-Office
 * Versión actualizada para PostgreSQL con soporte Supabase
 * Proporciona endpoints para monitorear el estado de la aplicación
 * y sus componentes críticos (base de datos, servicios externos, etc.)
 */

import { createMySQLTesterFromEnv, MySQLTestResult } from "./connectionTest.ts";
import { createPostgreSQLTesterFromEnv, PostgreSQLTestResult, CriticalTablesResult } from "./PostgreSQLTest.ts";
import { logger } from "../Utils/logger.ts";

export interface HealthCheckResult {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  uptime: number;
  version?: string;
  services: ServiceHealthCheck[];
  summary: {
    total: number;
    healthy: number;
    degraded: number;
    unhealthy: number;
  };
}

export interface ServiceHealthCheck {
  name: string;
  status: "healthy" | "degraded" | "unhealthy";
  responseTime?: number;
  message?: string;
  details?: Record<string, unknown>;
  lastCheck: string;
}

export interface DatabaseHealthDetails {
  connection: boolean;
  version?: string;
  database?: string;
  tablesCount?: number;
  criticalTables?: {
    total: number;
    existing: number;
    missing: string[];
  };
}

export class HealthChecker {
  private startTime: Date;
  private version?: string;

  constructor(version?: string) {
    this.startTime = new Date();
    this.version = version;
  }

  /**
   * Realiza un health check básico de la base de datos
   */
  async performBasicHealthCheck(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const services: ServiceHealthCheck[] = [];
    
    // Determinar qué tester usar basado en variables de entorno
    const usePostgreSQL = Deno.env.get("SUPABASE_URL") || Deno.env.get("POSTGRES_HOST");
    
    if (usePostgreSQL) {
      // Health check PostgreSQL
      const pgTester = createPostgreSQLTesterFromEnv();
      const pgResult = await pgTester.testFullConnection();
      
      const dbHealth: ServiceHealthCheck = {
        name: "database",
        status: pgResult.success ? "healthy" : "unhealthy",
        responseTime: Date.now() - startTime,
        message: pgResult.message,
        details: pgResult.details,
        lastCheck: pgResult.timestamp
      };
      
      services.push(dbHealth);
    } else {
      // Health check MySQL (fallback)
      const mysqlTester = createMySQLTesterFromEnv();
      const mysqlResult = await mysqlTester.testFullConnection();
      
      const dbHealth: ServiceHealthCheck = {
        name: "database",
        status: mysqlResult.success ? "healthy" : "unhealthy",
        responseTime: Date.now() - startTime,
        message: mysqlResult.message,
        details: mysqlResult.details,
        lastCheck: mysqlResult.timestamp
      };
      
      services.push(dbHealth);
    }

    // Health check del sistema
    const systemHealth = await this.checkSystemHealth();
    services.push(systemHealth);

    return this.calculateOverallHealth(services);
  }

  /**
   * Realiza un health check completo de todos los componentes
   */
  async performFullHealthCheck(): Promise<HealthCheckResult> {
    const services: ServiceHealthCheck[] = [];
    const usePostgreSQL = Deno.env.get("SUPABASE_URL") || Deno.env.get("POSTGRES_HOST");

    // Health check de base de datos PostgreSQL/Supabase
    if (usePostgreSQL) {
      const pgTester = createPostgreSQLTesterFromEnv();
      const pgResult = await pgTester.testFullConnection();
      
      const dbHealth: ServiceHealthCheck = {
        name: "database",
        status: pgResult.success ? "healthy" : "unhealthy",
        message: pgResult.message,
        details: pgResult.details,
        lastCheck: pgResult.timestamp
      };
      
      services.push(dbHealth);
      
      // Health check específico de Supabase
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      if (supabaseUrl) {
        const supabaseHealth = await this.checkSupabaseHealth();
        services.push(supabaseHealth);
      }
    } else {
      // Fallback a MySQL
      const mysqlTester = createMySQLTesterFromEnv();
      const mysqlResult = await mysqlTester.testFullConnection();
      
      const dbHealth: ServiceHealthCheck = {
        name: "database",
        status: mysqlResult.success ? "healthy" : "unhealthy",
        message: mysqlResult.message,
        details: mysqlResult.details,
        lastCheck: mysqlResult.timestamp
      };
      
      services.push(dbHealth);
    }

    // Health check del sistema
    const systemHealth = await this.checkSystemHealth();
    services.push(systemHealth);

    // Health check de memoria
    const memoryHealth = await this.checkMemoryHealth();
    services.push(memoryHealth);

    return this.calculateOverallHealth(services);
  }

  /**
   * Health check específico de la base de datos PostgreSQL
   */
  async checkDatabaseHealth(): Promise<ServiceHealthCheck> {
    const startTime = Date.now();
    const tester = createPostgreSQLTesterFromEnv();

    try {
      // Probar conexión básica
      const connectionResult = await tester.testFullConnection();
      
      if (!connectionResult.success) {
        return {
          name: "database",
          status: "unhealthy",
          responseTime: Date.now() - startTime,
          message: connectionResult.message,
          details: connectionResult.details,
          lastCheck: connectionResult.timestamp
        };
      }

      // Verificar tablas críticas
      const criticalTables = [
        "persona",
        "usuario", 
        "password",
        "celula",
        "permisos",
        "venta",
        "cliente"
      ];

      const tablesResult = await tester.checkCriticalTables(criticalTables);

      return {
        name: "database",
        status: tablesResult.success ? "healthy" : "degraded",
        responseTime: Date.now() - startTime,
        message: tablesResult.message,
        details: {
          connection: connectionResult.details,
          tables: tablesResult.details
        },
        lastCheck: tablesResult.timestamp
      };
    } catch (error) {
      logger.error("Error en database health check:", error);
      return {
        name: "database",
        status: "unhealthy",
        responseTime: Date.now() - startTime,
        message: `Error crítico: ${error instanceof Error ? error.message : String(error)}`,
        lastCheck: new Date().toISOString()
      };
    }
  }

  /**
   * Health check específico de Supabase
   */
  async checkSupabaseHealth(): Promise<ServiceHealthCheck> {
    const startTime = Date.now();
    const tester = createPostgreSQLTesterFromEnv();

    try {
      const supabaseResult = await tester.testSupabaseConnection();
      
      return {
        name: "supabase",
        status: supabaseResult.success ? "healthy" : "unhealthy",
        responseTime: Date.now() - startTime,
        message: supabaseResult.message,
        details: supabaseResult.details,
        lastCheck: supabaseResult.timestamp
      };
    } catch (error) {
      logger.error("Error en Supabase health check:", error);
      return {
        name: "supabase",
        status: "unhealthy",
        responseTime: Date.now() - startTime,
        message: `Error Supabase: ${error instanceof Error ? error.message : String(error)}`,
        lastCheck: new Date().toISOString()
      };
    }
  }

  /**
   * Health check de base de datos MySQL (fallback)
   */
  async checkMySQLHealth(): Promise<ServiceHealthCheck> {
    const startTime = Date.now();
    const tester = createMySQLTesterFromEnv();

    try {
      const result = await tester.testFullConnection();
      
      return {
        name: "database",
        status: result.success ? "healthy" : "unhealthy",
        responseTime: Date.now() - startTime,
        message: result.message,
        details: result.details,
        lastCheck: result.timestamp
      };
    } catch (error) {
      logger.error("Error en MySQL health check:", error);
      return {
        name: "database",
        status: "unhealthy",
        responseTime: Date.now() - startTime,
        message: `Error MySQL: ${error instanceof Error ? error.message : String(error)}`,
        lastCheck: new Date().toISOString()
      };
    }
  }

  /**
   * Health check del sistema
   */
  async checkSystemHealth(): Promise<ServiceHealthCheck> {
    try {
      const uptime = Date.now() - this.startTime.getTime();
      const memoryUsage = Deno.memoryUsage();
      const loadAverage = [0, 0, 0]; // systemLoadAverage no disponible en esta versión de Deno

      return {
        name: "system",
        status: "healthy",
        details: {
          uptime: uptime,
          uptimeHuman: this.formatUptime(uptime),
          memory: {
            used: memoryUsage.rss,
            total: memoryUsage.heapTotal,
            external: memoryUsage.external,
            heapUsed: memoryUsage.heapUsed
          },
          loadAverage: loadAverage,
          pid: Deno.pid,
          hostname: Deno.hostname(),
          version: this.version
        },
        lastCheck: new Date().toISOString()
      };
    } catch (error) {
      logger.error("Error en system health check:", error);
      return {
        name: "system",
        status: "degraded",
        message: `Error sistema: ${error instanceof Error ? error.message : String(error)}`,
        lastCheck: new Date().toISOString()
      };
    }
  }

  /**
   * Health check de memoria
   */
  async checkMemoryHealth(): Promise<ServiceHealthCheck> {
    try {
      const memoryUsage = Deno.memoryUsage();
      const heapUsedPercent = memoryUsage.heapTotal > 0 ? (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100 : 0;

      let status: "healthy" | "degraded" | "unhealthy" = "healthy";
      if (heapUsedPercent > 90) {
        status = "unhealthy";
      } else if (heapUsedPercent > 75) {
        status = "degraded";
      }

      return {
        name: "memory",
        status,
        details: {
          heapUsedPercent: Math.round(heapUsedPercent * 100) / 100,
          rss: memoryUsage.rss,
          heapTotal: memoryUsage.heapTotal,
          heapUsed: memoryUsage.heapUsed,
          external: memoryUsage.external
        },
        lastCheck: new Date().toISOString()
      };
    } catch (error) {
      logger.error("Error en memory health check:", error);
      return {
        name: "memory",
        status: "unhealthy",
        message: `Error memoria: ${error instanceof Error ? error.message : String(error)}`,
        lastCheck: new Date().toISOString()
      };
    }
  }

  /**
   * Calcula el estado general del sistema basado en los servicios
   */
  private calculateOverallHealth(services: ServiceHealthCheck[]): HealthCheckResult {
    const healthy = services.filter(s => s.status === "healthy").length;
    const degraded = services.filter(s => s.status === "degraded").length;
    const unhealthy = services.filter(s => s.status === "unhealthy").length;
    const total = services.length;

    let overallStatus: "healthy" | "degraded" | "unhealthy" = "healthy";
    
    if (unhealthy > 0) {
      overallStatus = "unhealthy";
    } else if (degraded > 0) {
      overallStatus = "degraded";
    }

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime.getTime(),
      version: this.version,
      services,
      summary: {
        total,
        healthy,
        degraded,
        unhealthy
      }
    };
  }

  /**
   * Formatea el uptime a formato legible
   */
  private formatUptime(uptime: number): string {
    const seconds = Math.floor(uptime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h ${minutes % 60}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Genera un reporte detallado en formato JSON
   */
  async generateDetailedReport(): Promise<string> {
    const healthCheck = await this.performFullHealthCheck();
    
    return JSON.stringify({
      ...healthCheck,
      metadata: {
        generated_at: new Date().toISOString(),
        generator: "System-Back-Office HealthChecker",
        version: this.version,
        environment: Deno.env.get("MODO") || "unknown"
      }
    }, null, 2);
  }
}

// Exportar instancia por defecto para uso fácil
export const healthChecker = new HealthChecker(
  Deno.env.get("APP_VERSION") || "1.0.0"
);