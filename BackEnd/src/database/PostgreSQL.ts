// database/PostgreSQL.ts
// ============================================
// Conexión a PostgreSQL con Supabase para System-Back-Office
// Versión resiliente con reintentos automáticos
// ============================================

import { Pool } from "https://deno.land/x/postgres@v0.19.3/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { logger } from "../Utils/logger.ts";
import { config } from "dotenv";

config({ export: true });

// ============================================
// CLASE DE CONEXIÓN RESILIENTE POSTGRESQL
// ============================================

export class ResilientPostgresConnection {
  private pool: Pool | null = null;
  private _isConnectedInternal = false;
  private retryCount = 0;
  private maxRetries = 10;
  private baseRetryDelay = 1000; // 1 segundo base
  private maxRetryDelay = 30000; // 30 segundos máximo
  private reconnectTimer: number | null = null;
  private lastError: Error | null = null;
  private lastConnectionAlert: {
    message: string;
    type: "success" | "warning" | "error";
    timestamp: string;
  } | null = null;

  constructor() {
    this.setupGracefulShutdown();
  }

  get isConnected(): boolean {
    return this._isConnectedInternal;
  }

  get connectionStatus() {
    return {
      connected: this._isConnectedInternal,
      retryCount: this.retryCount,
      maxRetries: this.maxRetries,
      lastError: this.lastError?.message || null,
      lastAlert: this.lastConnectionAlert
    };
  }

  /**
   * Calcula delay con backoff exponencial
   */
  private getRetryDelay(attempt: number): number {
    if (attempt <= 5) {
      return Math.min(this.baseRetryDelay * Math.pow(2, attempt - 1), this.maxRetryDelay);
    }
    return this.maxRetryDelay;
  }

  /**
   * Intenta conectar a PostgreSQL
   */
  async connect(): Promise<boolean> {
    try {
      // Limpiar timer existente
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }

      // Cerrar conexión existente
      if (this.pool) {
        await this.pool.end();
      }

      // Variables de entorno
      const postgresHost = Deno.env.get("POSTGRES_HOST") || Deno.env.get("DB_HOST");
      const postgresPort = Deno.env.get("POSTGRES_PORT") || Deno.env.get("DB_PORT") || "5432";
      const postgresUser = Deno.env.get("POSTGRES_USER") || Deno.env.get("DB_USER");
      const postgresPassword = Deno.env.get("POSTGRES_PASSWORD") || Deno.env.get("DB_PASSWORD");
      const postgresDatabase = Deno.env.get("POSTGRES_DB") || Deno.env.get("DB_NAME") || "postgres";

      if (!postgresHost || !postgresUser || !postgresPassword) {
        throw new Error("Faltan variables de entorno de PostgreSQL");
      }

      logger.info("🔌 Conectando a PostgreSQL...");
      logger.debug(`Host: ${postgresHost}, Port: ${postgresPort}, DB: ${postgresDatabase}`);

      // Crear nuevo pool
      this.pool = new Pool({
        hostname: postgresHost,
        port: Number(postgresPort),
        user: postgresUser,
        password: postgresPassword,
        database: postgresDatabase,
        maxConnections: 3,
        idleTimeout: 30000, // 30 segundos
        connectionTimeout: 10000, // 10 segundos
      });

      // Probar conexión
      const client = await this.pool.connect();
      const result = await client.queryArray`SELECT version() as version, CURRENT_TIMESTAMP as timestamp`;
      client.release();

      // Conexión exitosa
      this._isConnectedInternal = true;
      this.retryCount = 0;
      this.lastError = null;
      
      logger.info("✅ Conexión PostgreSQL establecida");
      logger.debug(`PostgreSQL Version: ${result.rows[0][0]}`);
      
      this.showConnectionAlert("✅ Conexión recuperada", "success");
      return true;

    } catch (error) {
      this._isConnectedInternal = false;
      this.lastError = error instanceof Error ? error : new Error(String(error));
      
      const errorMessage = this.lastError.message;
      logger.error(`❌ Error conexión PostgreSQL: ${errorMessage}`);
      
      // Iniciar reintentos automáticos
      this._scheduleReconnect();
      return false;
    }
  }

  /**
   * Programa el próximo reintento de conexión
   */
  private _scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.retryCount++;
    const delay = this.getRetryDelay(this.retryCount);

    logger.warn(`🔄 Reintentando conexión en ${delay/1000}s (intentos: ${this.retryCount}/${this.maxRetries})`);
    
    this.showConnectionAlert(
      `⚠️ Sin conexión DB - Reintentando en ${Math.ceil(delay/1000)}s (${this.retryCount}/${this.maxRetries})`, 
      "warning"
    );

    if (this.retryCount <= this.maxRetries) {
      this.reconnectTimer = setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      logger.error("🚨 Máximo de reintentos alcanzado - Modo degradado permanente");
      this.showConnectionAlert("🚨 Modo degradado - Sin conexión DB", "error");
    }
  }

  /**
   * Muestra alerta de conexión en formato destacado
   */
  private showConnectionAlert(message: string, type: "success" | "warning" | "error"): void {
    const timestamp = new Date().toLocaleTimeString();
    const icons = { success: "✅", warning: "⚠️", error: "🚨" };
    const separator = "=".repeat(80);
    
    console.log(`\n${separator}`);
    console.log(`${icons[type]} ${timestamp} [DATABASE ALERT] ${message}`);
    console.log(`${separator}\n`);
    
    // Almacenar para health check
    this.lastConnectionAlert = {
      message,
      type,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Ejecuta query de forma segura con manejo de conexión
   */
  async executeQuery<T = any>(
    query: string, 
    params: unknown[] = []
  ): Promise<{ rows: T[]; rowCount: number }> {
    if (!this._isConnectedInternal || !this.pool) {
      throw new ServiceDegradedError("Base de datos no disponible - Modo degradado");
    }

    const client = await this.pool.connect();
    try {
      const result = await client.queryObject<T[]>(query, ...params);
      return {
        rows: result.rows,
        rowCount: result.rowCount || 0
      };
    } catch (error) {
      // Si hay error, marcar conexión como no disponible y forzar reintentos
      this._isConnectedInternal = false;
      this._scheduleReconnect();
      
      logger.error(`❌ Error en query PostgreSQL: ${error}`);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Ejecuta query sin retorno de resultados
   */
  async executeNonQuery(
    query: string, 
    params: unknown[] = []
  ): Promise<{ affectedRows: number; lastInsertId?: number }> {
    if (!this._isConnectedInternal || !this.pool) {
      throw new ServiceDegradedError("Base de datos no disponible - Modo degradado");
    }

    const client = await this.pool.connect();
    try {
      const result = await client.queryObject(query, ...params);
      return {
        affectedRows: result.rowCount || 0
      };
    } catch (error) {
      this._isConnectedInternal = false;
      this._scheduleReconnect();
      
      logger.error(`❌ Error en query PostgreSQL: ${error}`);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Inicia transacción
   */
  async beginTransaction() {
    if (!this._isConnectedInternal || !this.pool) {
      throw new ServiceDegradedError("Base de datos no disponible - Modo degradado");
    }

    const client = await this.pool.connect();
    await client.queryArray`BEGIN`;
    return client;
  }

  /**
   * Cierra el pool de conexiones
   */
  async end(): Promise<void> {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
    
    this._isConnectedInternal = false;
  }

  /**
   * Configura graceful shutdown
   */
  private setupGracefulShutdown(): void {
    const shutdownHandler = async () => {
      logger.info("🔄 Cerrando conexión resiliente PostgreSQL...");
      await this.end();
    };

    // Windows soporta estos signals
    if (Deno.build.os === "windows") {
      Deno.addSignalListener("SIGINT", shutdownHandler);
    } else {
      Deno.addSignalListener("SIGTERM", shutdownHandler);
      Deno.addSignalListener("SIGINT", shutdownHandler);
    }
  }

  /**
   * Forzar reintentos de conexión (método público)
   */
  public scheduleReconnect(): void {
    this._isConnectedInternal = false;
    this._scheduleReconnect();
  }

  /**
   * Obtiene el contador de reintentos
   */
  public getRetryCount(): number {
    return this.retryCount;
  }

  /**
   * Obtiene el timestamp del último intento de conexión
   */
  public getLastConnectionAttempt(): string {
    return this.lastConnectionAlert?.timestamp || new Date().toISOString();
  }

  /**
   * Verifica el estado de la conexión (método público)
   */
  public async checkConnection(): Promise<boolean> {
    if (!this.pool) {
      return false;
    }

    try {
      const client = await this.pool.connect();
      await client.queryArray`SELECT 1`;
      client.release();
      return true;
    } catch (error) {
      this._isConnectedInternal = false;
      this._scheduleReconnect();
      return false;
    }
  }

  /**
   * Método query simplificado para compatibilidad con modelos
   */
  async query<T = any>(query: string, params: unknown[] = []): Promise<T> {
    const result = await this.executeQuery<T>(query, params);
    
    // Para SELECT queries, retornar rows directamente
    if (query.trim().toUpperCase().startsWith('SELECT')) {
      return result.rows as T;
    }
    
    // Para otras queries, retornar el resultado completo
    return result as T;
  }
}

/**
 * Operación segura con manejo de errores degradados
 */
export async function safeQuery<T>(
  connection: ResilientPostgresConnection,
  query: string, 
  params: unknown[] = []
): Promise<{ success: boolean; data?: any; error?: string }> {
  if (!connection.isConnected) {
    return {
      success: false,
      error: "🚨 Base de datos no disponible - Modo degradado. La conexión se restablecerá automáticamente."
    };
  }

  try {
    const result = await connection.executeQuery<T>(query, params);
    return { success: true, data: result };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`❌ Error en safeQuery: ${errorMessage}`);
    
    // Forzar reintentos programando nueva conexión
    if (connection.isConnected) {
      connection.scheduleReconnect();
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Clases de error específicas para sistema resiliente
 */
export class ServiceDegradedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ServiceDegradedError";
  }
}

export class DatabaseConnectionError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = "DatabaseConnectionError";
  }
}

export class DatabaseOperationError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = "DatabaseOperationError";
  }
}

// ============================================
// VARIABLES DE ENTORNO SUPABASE/POSTGRESQL
// ============================================

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

// Cliente Supabase
let supabase: ReturnType<typeof createClient> | null = null;

if (supabaseUrl && supabaseServiceKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    logger.info("✅ Cliente Supabase inicializado");
  } catch (error) {
    logger.error("❌ Error inicializando cliente Supabase:", error);
  }
}

// Pool de conexión resiliente
const resilientConnection = new ResilientPostgresConnection();

// Exportar cliente resiliente y Supabase
export { supabase };
export default resilientConnection;

// ============================================
// FUNCIONES ADICIONALES PARA POSTGRESQL
// ============================================

/**
 * Inicia una transacción con conexión resiliente
 */
export async function beginTransaction() {
  return await resilientConnection.beginTransaction();
}

/**
 * Confirma una transacción
 */
export async function commitTransaction(client: any) {
  await client.queryArray`COMMIT`;
  client.release();
}

/**
 * Revierte una transacción
 */
export async function rollbackTransaction(client: any) {
  await client.queryArray`ROLLBACK`;
  client.release();
}

/**
 * Verifica el estado de la conexión a PostgreSQL
 */
export async function checkConnection(): Promise<boolean> {
  return resilientConnection.isConnected;
}

/**
 * Verifica el estado de la conexión a Supabase
 */
export async function checkSupabaseConnection(): Promise<boolean> {
  if (!supabase) return false;
  
  try {
    const { data, error } = await supabase.from('persona').select('count').single();
    return !error;
  } catch (error) {
    logger.error("Error verificando conexión Supabase:", error);
    return false;
  }
}

/**
 * Iniciar conexión resiliente en background
 */
export async function initializeResilientConnection(): Promise<void> {
  logger.info("🔄 Iniciando sistema de conexión resiliente...");
  
  // Iniciar conexión en background - NO BLOQUEA
  resilientConnection.connect().catch(() => {
    logger.warn("⚠️ Aplicación iniciando en modo degradado - reconexión automática activa");
  });
  
  // Verificación periódica cada 60 segundos
  setInterval(() => {
    if (!resilientConnection.isConnected) {
      logger.debug("Verificando conexión periódica...");
      resilientConnection.connect();
    }
  }, 60000);
}

// ============================================
// MIGRACIÓN HELPER
// ============================================

export const mysqlToPostgresMap = {
  "AUTO_INCREMENT": "SERIAL or GENERATED BY DEFAULT AS IDENTITY",
  "ENUM('A','B')": "VARCHAR CHECK (column IN ('A','B'))",
  "TINYINT(1)": "BOOLEAN",
  "DATETIME": "TIMESTAMP WITHOUT TIME ZONE",
  "GROUP_CONCAT": "STRING_AGG",
  "DATE_FORMAT": "TO_CHAR",
  "LIMIT ?, ?": "LIMIT ? OFFSET ?",
  "NOW()": "NOW()",
  "CURDATE()": "CURRENT_DATE"
};

/**
 * Log de ayuda para migración
 */
logger.info("🔄 Migration Helper - MySQL → PostgreSQL:");
logger.info("   • AUTO_INCREMENT → SERIAL");
logger.info("   • ENUM → VARCHAR + CHECK constraint");
logger.info("   • TINYINT(1) → BOOLEAN");
logger.info("   • GROUP_CONCAT → STRING_AGG");
logger.info("   • DATE_FORMAT → TO_CHAR");