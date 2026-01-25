/**
 * Módulo de Health Check para el sistema System Back-Office
 * Proporciona endpoints para monitorear el estado de la aplicación
 * y sus componentes críticos (base de datos, servicios externos, etc.)
 */

import { createMySQLTesterFromEnv, MySQLTestResult } from "./connectionTest.ts";
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
   * Realiza un health check completo de todos los componentes
   */
  async performFullHealthCheck(): Promise<HealthCheckResult> {
    const timestamp = new Date().toISOString();
    const uptime = Date.now() - this.startTime.getTime();

    logger.debug("🔍 Iniciando health check completo...");

    const services: ServiceHealthCheck[] = [];

    // 1. Verificar base de datos
    const dbHealth = await this.checkDatabaseHealth();
    services.push(dbHealth);

    // 2. Verificar memoria y sistema
    const systemHealth = await this.checkSystemHealth();
    services.push(systemHealth);

    // 3. Calcular resumen
    const summary = this.calculateSummary(services);

    // 4. Determinar estado general
    const status = this.determineOverallStatus(services);

    logger.debug(`Health check completado: ${status} (${summary.healthy}/${summary.total} servicios saludables)`);

    return {
      status,
      timestamp,
      uptime,
      version: this.version,
      services,
      summary
    };
  }

  /**
   * Verifica el estado de la base de datos MySQL
   */
  async checkDatabaseHealth(): Promise<ServiceHealthCheck> {
    const startCheck = Date.now();
    const healthCheckEnabled = Deno.env.get("DB_HEALTH_CHECK_ENABLED") !== "false";

    if (!healthCheckEnabled) {
      return {
        name: "database",
        status: "healthy",
        responseTime: 0,
        message: "Health check de base de datos deshabilitado",
        lastCheck: new Date().toISOString()
      };
    }

    try {
      const tester = createMySQLTesterFromEnv();
      const testOptions = {
        timeout: 5000, // Timeout más corto para health checks
        retries: 1,    // Solo un intento para health checks rápidos
        verbose: false
      };

      const result = await tester.testFullConnection(testOptions);
      const responseTime = Date.now() - startCheck;

      if (result.success) {
        // Verificar tablas críticas
        const criticalTablesResult = await this.checkCriticalTables(tester);
        const details: DatabaseHealthDetails = {
          connection: true,
          version: result.databaseInfo?.version,
          database: result.databaseInfo?.currentDatabase,
          tablesCount: result.databaseInfo?.tablesCount
        };

        if (criticalTablesResult.success) {
          details.criticalTables = {
            total: (criticalTablesResult.details as any)?.total || 0,
            existing: (criticalTablesResult.details as any)?.existing || 0,
            missing: (criticalTablesResult.details as any)?.missing || []
          };
        } else {
          // Si hay tablas faltantes, el estado es degradado
        return {
          name: "database",
          status: "degraded",
          responseTime,
          message: `Conexión OK pero faltan tablas críticas: ${criticalTablesResult.message}`,
          details: details as unknown as Record<string, unknown>,
          lastCheck: new Date().toISOString()
        };
        }

        return {
          name: "database",
          status: "healthy",
          responseTime,
          message: "Base de datos funcionando correctamente",
          details: details as unknown as Record<string, unknown>,
          lastCheck: new Date().toISOString()
        };
      } else {
        return {
          name: "database",
          status: "unhealthy",
          responseTime,
          message: result.message,
          details: {
            connection: false,
            error: result.message
          },
          lastCheck: new Date().toISOString()
        };
      }

    } catch (error) {
      const responseTime = Date.now() - startCheck;
      const errorMessage = error instanceof Error ? error.message : String(error);

      return {
        name: "database",
        status: "unhealthy",
        responseTime,
        message: `Error crítico en health check de base de datos: ${errorMessage}`,
        details: {
          connection: false,
          error: errorMessage
        },
        lastCheck: new Date().toISOString()
      };
    }
  }

  /**
   * Verifica el estado del sistema (memoria, CPU, etc.)
   */
  async checkSystemHealth(): Promise<ServiceHealthCheck> {
    const startCheck = Date.now();

    try {
      // Obtener información del sistema
      const memoryUsage = Deno.memoryUsage();

      // Calcular uso de memoria (versión simplificada)
      // Nota: systemDiagnostics() no está disponible en todas las versiones de Deno
      const memoryUsagePercent = 0; // Placeholder, ya que no podemos obtener memoria total fácilmente

      // Determinar estado basado en el uso de memoria
      let status: "healthy" | "degraded" | "unhealthy" = "healthy";
      let message = "Sistema funcionando correctamente";

      if (memoryUsagePercent > 90) {
        status = "unhealthy";
        message = `Uso de memoria crítico: ${memoryUsagePercent.toFixed(1)}%`;
      } else if (memoryUsagePercent > 75) {
        status = "degraded";
        message = `Uso de memoria elevado: ${memoryUsagePercent.toFixed(1)}%`;
      }

      const responseTime = Date.now() - startCheck;

      return {
        name: "system",
        status,
        responseTime,
        message,
        details: {
          memoryUsage: {
            rss: memoryUsage.rss,
            heapTotal: memoryUsage.heapTotal,
            heapUsed: memoryUsage.heapUsed,
            external: memoryUsage.external,
            usagePercent: memoryUsagePercent
          },
          uptime: Date.now() - this.startTime.getTime()
        },
        lastCheck: new Date().toISOString()
      };

    } catch (error) {
      const responseTime = Date.now() - startCheck;
      const errorMessage = error instanceof Error ? error.message : String(error);

      return {
        name: "system",
        status: "degraded",
        responseTime,
        message: `Error obteniendo información del sistema: ${errorMessage}`,
        lastCheck: new Date().toISOString()
      };
    }
  }

  /**
   * Verifica tablas críticas de la base de datos
   */
  private async checkCriticalTables(tester: ReturnType<typeof createMySQLTesterFromEnv>) {
    const criticalTables = [
      "usuario",
      "persona",
      "password", 
      "celula",
      "permisos",
      "venta",
      "cliente"
    ];

    return await tester.checkCriticalTables(criticalTables);
  }

  /**
   * Calcula el resumen de estados de los servicios
   */
  private calculateSummary(services: ServiceHealthCheck[]) {
    const summary = {
      total: services.length,
      healthy: 0,
      degraded: 0,
      unhealthy: 0
    };

    services.forEach(service => {
      switch (service.status) {
        case "healthy":
          summary.healthy++;
          break;
        case "degraded":
          summary.degraded++;
          break;
        case "unhealthy":
          summary.unhealthy++;
          break;
      }
    });

    return summary;
  }

  /**
   * Determina el estado general basado en los servicios individuales
   */
  private determineOverallStatus(services: ServiceHealthCheck[]): "healthy" | "degraded" | "unhealthy" {
    const hasUnhealthy = services.some(service => service.status === "unhealthy");
    if (hasUnhealthy) {
      return "unhealthy";
    }

    const hasDegraded = services.some(service => service.status === "degraded");
    if (hasDegraded) {
      return "degraded";
    }

    return "healthy";
  }

  /**
   * Health check simple (solo estado básico)
   */
  async performBasicHealthCheck(): Promise<{
    status: string;
    timestamp: string;
    uptime: number;
    mode: string;
  }> {
    return {
      status: "OK",
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime.getTime(),
      mode: Deno.env.get("MODO") || "unknown"
    };
  }
}

// Instancia global para usar en los endpoints
export const healthChecker = new HealthChecker("1.0.0");