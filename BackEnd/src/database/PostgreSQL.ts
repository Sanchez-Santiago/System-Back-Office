// src/db/PostgresClient.ts
// Sistema de conexión a PostgreSQL con fallback automático
// 1. Intenta con deno-postgres (driver nativo Deno)
// 2. Si falla, usa supabase-js (cliente oficial Supabase)

import type { SupabaseClient } from "jsr:@supabase/supabase-js@2";

// Tipos para los diferentes clientes
type PostgresClientType = any; // deno-postgres Client
type ConnectionType = 'deno-postgres' | 'supabase-js' | null;

export class PostgresClient {
  private client: PostgresClientType | null = null;
  private supabase: SupabaseClient | null = null;
  private connected = false;
  private connectionType: ConnectionType = null;
  private url: string;

  constructor() {
    const url = Deno.env.get("POSTGRES_URL");
    if (!url) {
      throw new Error("POSTGRES_URL is not defined");
    }
    this.url = url;
  }

  async connect(): Promise<void> {
    if (this.connected) return;

    console.log("🔄 Iniciando conexión a PostgreSQL...");
    console.log(`📝 URL configurada: ${this.url.substring(0, 50)}...`);

    // ============ INTENTO 1: deno-postgres ============
    try {
      console.log("🔌 Intentando con driver: deno-postgres (nativo Deno)...");
      
      const { Client } = await import("https://deno.land/x/postgres@v0.17.0/mod.ts");
      console.log("✅ Driver deno-postgres importado correctamente");
      
      this.client = new Client(this.url);
      console.log("⏳ Conectando...");
      
      // Timeout manual para deno-postgres
      const timeoutMs = 15000; // 15 segundos
      const connectPromise = this.client.connect();
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`Timeout después de ${timeoutMs}ms`)), timeoutMs);
      });
      
      await Promise.race([connectPromise, timeoutPromise]);
      
      this.connectionType = 'deno-postgres';
      this.connected = true;
      console.log("✅ Conexión exitosa con deno-postgres");
      
      // Verificar conexión con query simple
      try {
        const result = await this.client.queryArray("SELECT version()");
        console.log("📊 PostgreSQL versión:", result.rows[0][0]);
      } catch (e) {
        console.warn("⚠️ No se pudo verificar versión, pero la conexión está activa");
      }
      
    } catch (error1) {
      console.warn("❌ deno-postgres falló:", (error1 as Error).message);
      
      // ============ INTENTO 2: supabase-js ============
      try {
        console.log("🔌 Intentando con cliente: supabase-js (oficial Supabase)...");
        
        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
        
        if (!supabaseUrl || !supabaseKey) {
          throw new Error("SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no definidos");
        }
        
        const { createClient } = await import("jsr:@supabase/supabase-js@2");
        console.log("✅ Cliente supabase-js importado correctamente");
        
        this.supabase = createClient(supabaseUrl, supabaseKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        });
        
        // Verificar conexión con query simple
        console.log("⏳ Verificando conexión a Supabase...");
        const { data, error } = await this.supabase.from('empresa').select('count').limit(1);
        
        if (error) {
          throw new Error(`Error de conexión Supabase: ${error.message}`);
        }
        
        this.connectionType = 'supabase-js';
        this.connected = true;
        console.log("✅ Conexión exitosa con supabase-js");
        console.log("📊 Conectado a proyecto Supabase:", supabaseUrl);
        
      } catch (error2) {
        console.error("❌ supabase-js también falló:", (error2 as Error).message);
        throw new Error(
          `No se pudo conectar a la base de datos.\n` +
          `deno-postgres: ${(error1 as Error).message}\n` +
          `supabase-js: ${(error2 as Error).message}`
        );
      }
    }

    console.log(`✅ Tipo de conexión activa: ${this.connectionType}\n`);
  }

  // Método para ejecutar queries (compatible con ambos drivers)
  async query<T = any>(sql: string, params?: any[]): Promise<T[]> {
    if (!this.connected) {
      throw new Error("Cliente no conectado. Llama a connect() primero.");
    }

    try {
      if (this.connectionType === 'deno-postgres' && this.client) {
        // Usar deno-postgres
        const result = params 
          ? await this.client.queryArray(sql, ...params)
          : await this.client.queryArray(sql);
        return result.rows as T[];
        
      } else if (this.connectionType === 'supabase-js' && this.supabase) {
        // Usar supabase-js (más limitado, solo soporta queries simples via RPC)
        // Para queries complejos, usar el REST API de Supabase
        console.warn("⚠️ Usando supabase-js - algunas queries pueden no funcionar igual que con PostgreSQL nativo");
        
        // Intentar ejecutar via RPC si está disponible
        const { data, error } = await this.supabase.rpc('exec_sql', { 
          query: sql,
          params: params || []
        });
        
        if (error) {
          throw new Error(`Error en query Supabase: ${error.message}`);
        }
        
        return data as T[];
      }
      
      throw new Error("Tipo de conexión desconocido");
      
    } catch (error) {
      console.error("❌ Error ejecutando query:", (error as Error).message);
      throw error;
    }
  }

  // Método para obtener el cliente original (si se necesita acceso directo)
  getClient(): PostgresClientType | SupabaseClient | null {
    if (!this.connected) {
      throw new Error("Postgres client is not connected");
    }
    return this.connectionType === 'deno-postgres' ? this.client : this.supabase;
  }

  // Obtener tipo de conexión actual
  getConnectionType(): ConnectionType {
    return this.connectionType;
  }

  async close(): Promise<void> {
    if (!this.connected) return;

    try {
      if (this.connectionType === 'deno-postgres' && this.client) {
        await this.client.end();
      }
      // supabase-js no requiere cierre explícito
      
      this.connected = false;
      this.connectionType = null;
      console.log("🔌 Conexión PostgreSQL cerrada");
    } catch (error) {
      console.error("❌ Error cerrando conexión:", (error as Error).message);
    }
  }
}

// Exportar singleton para uso global
let postgresClientInstance: PostgresClient | null = null;

export function getPostgresClient(): PostgresClient {
  if (!postgresClientInstance) {
    postgresClientInstance = new PostgresClient();
  }
  return postgresClientInstance;
}
