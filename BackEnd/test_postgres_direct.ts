import { Application, Router, Context } from "https://deno.land/x/oak@v17.1.5/mod.ts";
import { load } from "https://deno.land/std/dotenv/mod.ts";
import { Pool } from "https://deno.land/x/postgres@v0.19.3/mod.ts";

await load({ export: true, allowEmptyValues: true });

const app = new Application();
const router = new Router();

// Health check básico
router.get("/", (ctx: Context) => {
  ctx.response.body = "✅ Servidor PostgreSQL Resiliente Funcionando";
});

router.get("/health", (ctx: Context) => {
  ctx.response.body = {
    status: "healthy",
    message: "✅ Conexión PostgreSQL directa",
    timestamp: new Date().toISOString(),
  };
});

// Prueba de conexión directa a PostgreSQL
router.get("/test-direct-postgres", async (ctx: Context) => {
  try {
    const postgresHost = Deno.env.get("POSTGRES_HOST");
    const postgresPort = Deno.env.get("POSTGRES_PORT");
    const postgresUser = Deno.env.get("POSTGRES_USER");
    const postgresPassword = Deno.env.get("POSTGRES_PASSWORD");
    const postgresDatabase = Deno.env.get("POSTGRES_DB");

    console.log("🔌 Intentando conexión directa PostgreSQL...");
    console.log(`   Host: ${postgresHost}`);
    console.log(`   Port: ${postgresPort}`);
    console.log(`   Database: ${postgresDatabase}`);
    console.log(`   User: ${postgresUser}`);

    const pool = new Pool({
      hostname: postgresHost,
      port: Number(postgresPort),
      user: postgresUser,
      password: postgresPassword,
      database: postgresDatabase,
      maxConnections: 3,
      idleTimeout: 30000,
      connectionTimeout: 10000,
    });

    const client = await pool.connect();
    const result = await client.queryArray`SELECT version() as version, CURRENT_TIMESTAMP as timestamp`;
    client.release();

    ctx.response.body = {
      success: true,
      message: "✅ Conexión PostgreSQL directa exitosa",
      data: {
        version: result.rows[0][0],
        timestamp: result.rows[0][1],
        connection_info: {
          host: postgresHost,
          port: postgresPort,
          database: postgresDatabase,
          user: postgresUser,
        },
      },
    };
  } catch (error) {
    console.error("❌ Error en conexión PostgreSQL:", error);
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      message: "❌ Error en conexión PostgreSQL directa",
      error: error instanceof Error ? error.message : "Unknown error",
      connection_info: {
        host: Deno.env.get("POSTGRES_HOST"),
        port: Deno.env.get("POSTGRES_PORT"),
        database: Deno.env.get("POSTGRES_DB"),
        user: Deno.env.get("POSTGRES_USER"),
      },
    };
  }
});

app.get("/test-env", (ctx: Context) => {
  ctx.response.body = {
    environment: {
      postgres_host: Deno.env.get("POSTGRES_HOST"),
      postgres_port: Deno.env.get("POSTGRES_PORT"),
      postgres_user: Deno.env.get("POSTGRES_USER"),
      postgres_database: Deno.env.get("POSTGRES_DB"),
      postgres_password: Deno.env.get("POSTGRES_PASSWORD") ? "***" : undefined,
      supabase_url: Deno.env.get("SUPABASE_URL"),
      supabase_key: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ? "***" : undefined,
    },
    timestamp: new Date().toISOString(),
  };
});

const port = parseInt(Deno.env.get("PORT") || "8003");

console.log("🚀 Iniciando servidor de pruebas PostgreSQL directa...");
console.log(`🌐 Puerto: ${port}`);
console.log("📊 Endpoints:");
console.log("   - GET /");
console.log("   - GET /health");
console.log("   - GET /test-direct-postgres");
console.log("   - GET /test-env");

await app.listen({ port });
console.log("✅ Servidor PostgreSQL directa iniciado");