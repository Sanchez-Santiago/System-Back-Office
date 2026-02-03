// src/db/PostgresClient.ts
import { Client } from "postgres";

export class PostgresClient {
  private client: Client;
  private connected = false;

  constructor() {
    const url = Deno.env.get("POSTGRES_URL");
    if (!url) {
      throw new Error("POSTGRES_URL is not defined");
    }

    this.client = new Client(url);
  }

  async connect(): Promise<void> {
    if (this.connected) return;

    console.log("🔄 Conectando a PostgreSQL (Supabase)...");

    await this.client.connect();
    this.connected = true;

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
