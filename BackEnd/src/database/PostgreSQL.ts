// src/db/PostgresClient.ts
// Cliente PostgreSQL usando Supabase (oficial y compatible con Deno Deploy)

import { createClient, SupabaseClient } from "jsr:@supabase/supabase-js@2";

export class PostgresClient {
  private supabase: SupabaseClient | null = null;
  private connected = false;

  constructor() {
    // No se requiere inicialización en constructor
  }

  async connect(): Promise<void> {
    if (this.connected) return;

    console.log("🔄 Iniciando conexión a Supabase...");

    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      
      if (!supabaseUrl) {
        throw new Error("SUPABASE_URL no está definida en las variables de entorno");
      }
      
      if (!supabaseKey) {
        throw new Error("SUPABASE_SERVICE_ROLE_KEY no está definida en las variables de entorno");
      }

      console.log(`📝 URL de Supabase: ${supabaseUrl}`);
      console.log(`🔑 API Key configurada: ${supabaseKey.substring(0, 20)}...`);
      
      console.log("🔌 Creando cliente Supabase...");
      this.supabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });
      
      // Verificar conexión con query simple
      console.log("⏳ Verificando conexión...");
      const { data, error } = await this.supabase.from('empresa').select('empresa_id').limit(1);
      
      if (error) {
        console.error("❌ Error de conexión Supabase:", error.message);
        console.error("Detalles:", JSON.stringify(error, null, 2));
        throw new Error(`Error de conexión Supabase: ${error.message}`);
      }
      
      this.connected = true;
      console.log("✅ Conexión exitosa a Supabase");
      console.log(`📊 Conectado a: ${supabaseUrl}\n`);
      
    } catch (error) {
      console.error("❌ Error conectando a Supabase:", (error as Error).message);
      throw error;
    }
  }

  // Obtener el cliente Supabase
  getClient(): SupabaseClient {
    if (!this.connected || !this.supabase) {
      throw new Error("Cliente no conectado. Llama a connect() primero.");
    }
    return this.supabase;
  }

  // Verificar si está conectado
  isConnected(): boolean {
    return this.connected;
  }

  async close(): Promise<void> {
    if (!this.connected) return;
    
    this.connected = false;
    this.supabase = null;
    console.log("🔌 Conexión Supabase cerrada");
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
