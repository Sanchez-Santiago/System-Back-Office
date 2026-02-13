// src/db/PostgresClient.ts
import { Client } from "postgres";

export class PostgresClient {
  private client: Client;
  private connected = false;
  private maxRetries: number;
  private connectionTimeout: number;

  constructor() {
    const url = Deno.env.get("POSTGRES_URL");
    if (!url) {
      throw new Error("POSTGRES_URL is not defined");
    }

    this.client = new Client(url);
    
    // Configuración desde variables de entorno
    this.maxRetries = parseInt(Deno.env.get("DB_CONNECTION_RETRIES") || "3");
    this.connectionTimeout = parseInt(Deno.env.get("DB_CONNECTION_TIMEOUT") || "10000");
  }

  async connect(): Promise<void> {
    if (this.connected) return;

    console.log(`🔄 Conectando a PostgreSQL (max retries: ${this.maxRetries}, timeout: ${this.connectionTimeout}ms)...`);

    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        // Intentar conexión con timeout
        const connectPromise = this.client.connect();
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error(`Connection timeout after ${this.connectionTimeout}ms`)), this.connectionTimeout);
        });
        
        await Promise.race([connectPromise, timeoutPromise]);
        this.connected = true;
        
        if (attempt > 1) {
          console.log(`✅ Conexión establecida en intento ${attempt}`);
        } else {
          console.log("✅ Conexión establecida");
        }
        break;
        
      } catch (error) {
        lastError = error as Error;
        console.warn(`⚠️ Intento ${attempt}/${this.maxRetries} fallido: ${lastError.message}`);
        
        if (attempt < this.maxRetries) {
          const delay = Math.min(1000 * attempt, 5000); // Delay exponencial con máximo 5s
          console.log(`⏳ Reintentando en ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    if (!this.connected) {
      throw new Error(`No se pudo conectar a PostgreSQL después de ${this.maxRetries} intentos: ${lastError?.message}`);
    }

    console.log("✅ Conexión establecida");

    // =============================
    // CHECK 1: Servidor responde
    // =============================
    const version = await this.client.queryArray("SELECT version()");
    console.log("📊 PostgreSQL:", version.rows[0][0]);

    // =============================
    // CHECK 2: Fecha / hora
    // =============================
    const now = await this.client.queryArray("SELECT NOW()");
    console.log("🕐 Server time:", now.rows[0][0]);

    // =============================
    // CHECK 3: Tablas en public
    // =============================
    const tables = await this.client.queryArray(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    if (tables.rows.length === 0) {
      console.warn("⚠️ No hay tablas en el schema 'public'");
    } else {
      console.log(`📋 Tablas encontradas (${tables.rows.length}):`);
      tables.rows.forEach(t => console.log(`  - ${t[0]}`));
    }

    // =============================
    // CHECK 4: Tabla clave (empresa)
    // =============================
    try {
      await this.client.queryArray(
        "SELECT 1 FROM empresa LIMIT 1"
      );
      console.log("🏢 Tabla 'empresa' OK");
    } catch {
      console.warn(
        "⚠️ Tabla 'empresa' no existe en 'public' (puede estar en otro schema)"
      );
    }

    console.log("✅ Base de datos validada correctamente\n");
  }

  getClient(): Client {
    if (!this.connected) {
      throw new Error("Postgres client is not connected");
    }
    return this.client;
  }

  async close(): Promise<void> {
    if (!this.connected) return;

    await this.client.end();
    this.connected = false;
    console.log("🔌 Conexión PostgreSQL cerrada");
  }
}
