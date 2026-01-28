import { Application, Router, Context } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { load } from "https://deno.land/std/dotenv/mod.ts";

await load({ export: true, allowEmptyValues: true });

const app = new Application();

const router = new Router();

// Health check básico
router.get("/health", (ctx: Context) => {
  ctx.response.status = 200;
  ctx.response.body = {
    status: "healthy",
    message: "✅ Sistema resiliente PostgreSQL funcionando",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  };
});

// Health check con detalles de entorno
router.get("/health/env", (ctx: Context) => {
  ctx.response.status = 200;
  ctx.response.body = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: {
      hasSupabaseUrl: !!Deno.env.get("SUPABASE_URL"),
      hasSupabaseKey: !!Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
      postgresHost: Deno.env.get("POSTGRES_HOST"),
      postgresPort: Deno.env.get("POSTGRES_PORT"),
      postgresDb: Deno.env.get("POSTGRES_DB"),
    },
  };
});

app.use(router.routes());

const port = parseInt(Deno.env.get("PORT") || "8000");

console.log("🚀 Iniciando servidor de pruebas...");
console.log(`🌐 Puerto: ${port}`);
console.log(`📊 Health checks disponibles:`);
console.log(`   - GET http://localhost:${port}/health`);
console.log(`   - GET http://localhost:${port}/health/env`);

await app.listen({ port });
console.log("✅ Servidor iniciado correctamente");