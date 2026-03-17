// src/database/PostgreSQL.ts
// Sistema de conexión PostgreSQL usando pg Pool (Node.js)

import { Pool, QueryResult } from 'pg';

export class PostgresClient {
  private pool: Pool | null = null;
  private connected = false;

  constructor() {
    const postgresUrl = process.env.POSTGRES_URL;
    if (!postgresUrl) {
      throw new Error('POSTGRES_URL no está definida en las variables de entorno');
    }
    this.initPool(postgresUrl);
  }

  private initPool(connectionString: string): void {
    console.log('🔄 Configurando pool de conexiones PostgreSQL...');
    
    // Parsear la URL de conexión
    const url = new URL(connectionString);
    const isSSL = url.searchParams.get('sslmode') !== 'disable';
    
    // Configuración de conexión
    const poolConfig: any = {
      host: url.hostname,
      port: parseInt(url.port) || 5432,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1) || 'postgres',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    };
    
    // Agregar SSL si es necesario
    if (isSSL) {
      poolConfig.ssl = {
        rejectUnauthorized: false,
      };
    }
    
    console.log('📝 Host:', poolConfig.host);
    
    this.pool = new Pool(poolConfig);

    this.pool.on('error', (err: Error) => {
      console.error('❌ Error inesperado en el pool de conexiones:', err.message);
    });
  }

  async connect(): Promise<void> {
    if (this.connected) return;

    if (!this.pool) {
      throw new Error('Pool no inicializado');
    }

    console.log('🔄 Iniciando conexión a base de datos...');
    console.log(`📝 URL configurada: ${process.env.POSTGRES_URL?.substring(0, 50)}...`);

    try {
      const client = await this.pool.connect();
      
      const result = await client.query('SELECT version()');
      console.log('📊 Versión PostgreSQL:', result.rows[0].version);
      
      client.release();
      
      this.connected = true;
      console.log('✅ Conexión PostgreSQL establecida exitosamente\n');
    } catch (error) {
      console.error('\n❌ Error al conectar con PostgreSQL:');
      console.error('   Error:', (error as Error).message);
      throw new Error(`No se pudo conectar a PostgreSQL: ${(error as Error).message}`);
    }
  }

  async query(sql: string, params?: any[]): Promise<any[]> {
    if (!this.connected || !this.pool) {
      throw new Error('Cliente no conectado. Llama a connect() primero.');
    }

    try {
      const result: QueryResult = params
        ? await this.pool.query(sql, params)
        : await this.pool.query(sql);
      
      return result.rows;
    } catch (error) {
      console.error('❌ Error ejecutando query:', (error as Error).message);
      throw error;
    }
  }

  getNativeClient(): Pool {
    if (!this.connected || !this.pool) {
      throw new Error('Cliente no conectado');
    }
    return this.pool;
  }

  getClient(): any {
    const pool = this.getNativeClient();
    
    return {
      queryObject: async (sql: string, params?: any[]) => {
        const result = params ? await pool.query(sql, params) : await pool.query(sql);
        return { rows: result.rows };
      },
      queryArray: async (sql: string, params?: any[]) => {
        const result = params ? await pool.query(sql, params) : await pool.query(sql);
        return { rows: result.rows };
      },
      query: async (sql: string, params?: any[]) => {
        const result = params ? await pool.query(sql, params) : await pool.query(sql);
        return result.rows;
      },
      end: async () => {
        // No hacer nada, el pool se cierra en close()
      },
    };
  }

  isConnected(): boolean {
    return this.connected;
  }

  async close(): Promise<void> {
    if (!this.connected || !this.pool) return;

    try {
      await this.pool.end();
      this.connected = false;
      console.log('🔌 Conexión cerrada');
    } catch (error) {
      console.error('❌ Error cerrando conexión:', (error as Error).message);
    }
  }
}

let postgresClientInstance: PostgresClient | null = null;

export function getPostgresClient(): PostgresClient {
  if (!postgresClientInstance) {
    postgresClientInstance = new PostgresClient();
  }
  return postgresClientInstance;
}

export default PostgresClient;
