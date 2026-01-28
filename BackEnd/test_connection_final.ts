import { load } from "https://deno.land/std/dotenv/mod.ts";
import { Pool } from "https://deno.land/x/postgres@v0.19.3/mod.ts";

await load({ export: true, allowEmptyValues: true });

console.log("🚀 Test de Conexión PostgreSQL Resiliente");

const postgresHost = Deno.env.get("POSTGRES_HOST");
const postgresPort = Deno.env.get("POSTGRES_PORT");
const postgresUser = Deno.env.get("POSTGRES_USER");
const postgresPassword = Deno.env.get("POSTGRES_PASSWORD");
const postgresDatabase = Deno.env.get("POSTGRES_DB");
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

console.log("🔍 Variables de Entorno:");
console.log(`   PostgreSQL Host: ${postgresHost}`);
console.log(`   PostgreSQL Port: ${postgresPort}`);
console.log(`   PostgreSQL Database: ${postgresDatabase}`);
console.log(`   Supabase URL: ${supabaseUrl ? supabaseUrl.substring(0, 20) + "..." : "NO CONFIGURADA"}`);

async function testPostgresConnection() {
  console.log("🔌 Probando conexión PostgreSQL directa...");
  
  try {
    const pool = new Pool({
      hostname: postgresHost,
      port: Number(postgresPort),
      user: postgresUser,
      password: postgresPassword,
      database: postgresDatabase,
      maxConnections: 2,
      idleTimeout: 10000,
      connectionTimeout: 5000,
    });

    const client = await pool.connect();
    const result = await client.queryArray`SELECT version() as version`;
    client.release();

    console.log("✅ CONEXIÓN POSTGRESQL EXITOSA");
    console.log(`   PostgreSQL Version: ${result.rows[0][0]}`);
    return true;
  } catch (error) {
    console.error("❌ Error PostgreSQL:", error instanceof Error ? error.message : error);
    return false;
  }
}

async function testSupabaseConnection() {
  console.log("🔌 Probando conexión Supabase...");
  
  try {
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.39.0");
    
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const { data, error } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('schema', 'public')
        .limit(5);
        
      if (error) {
        console.error("❌ Error Supabase:", error);
        return false;
      } else {
        console.log("✅ CONEXIÓN SUPABASE EXITOSA");
        console.log(`   Tablas encontradas: ${data?.map((t: any) => t.table_name).join(", ")}`);
        console.log("🎯 Supabase funcional con tablas");
        return true;
      }
    } else {
      console.error("❌ No hay credenciales de Supabase");
      return false;
    }
  } catch (error) {
    console.error("❌ Error importando Supabase:", error);
    return false;
  }
}

async function main() {
  console.log("🔄 Iniciando pruebas de conexión...");
  
  const postgresResult = await testPostgresConnection();
  const supabaseResult = await testSupabaseConnection();
  
  console.log("\n📊 RESULTADO FINAL:");
  console.log(`   PostgreSQL Directa: ${postgresResult ? "✅ CONECTADO" : "❌ ERROR"}`);
  console.log(`   Supabase: ${supabaseResult ? "✅ CONECTADO" : "❌ ERROR"}`);
  
  if (postgresResult || supabaseResult) {
    console.log("\n🎯 AL MENOS UNA CONEXIÓN ESTÁ FUNCIONAL");
    console.log("✅ El sistema puede migrar y operar con la base de datos");
  } else {
    console.log("\n⚠️  NINGUNA DE LAS CONEXIONES FUNCIONÓ");
    console.log("❌ Verificar variables de entorno y credenciales");
  }
}

main().catch((error) => {
  console.error("❌ Error crítico:", error);
  Deno.exit(1);
});