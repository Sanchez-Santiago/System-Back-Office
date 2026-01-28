import { load } from "https://deno.land/std/dotenv/mod.ts";
import { Pool } from "https://deno.land/x/postgres@v0.19.3/mod.ts";

await load({ export: true, allowEmptyValues: true });

console.log("🚀 Test directo de conexión PostgreSQL");

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

async function testConnection() {
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

  console.log("✅ CONEXIÓN POSTGRESQL DIRECTA EXITOSA!");
  console.log("📊 Resultado:");
  console.log(`   Version: ${result.rows[0][0]}`);
  console.log(`   Timestamp: ${result.rows[0][1]}`);
  console.log("🎯 El sistema PostgreSQL está funcional");
}

try {
  await testConnection();
} catch (error) {
  console.error("❌ ERROR EN CONEXIÓN POSTGRESQL:");
  console.error(`   ${error instanceof Error ? error.message : "Unknown error"}`);
  
  // Probar con Supabase como fallback
  console.log("🔄 Intentando con Supabase como fallback...");
  
  try {
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.39.0");
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const { data, error } = await supabase
        .from('persona')
        .select('*')
        .limit(1);
        
      if (error) {
        console.error("❌ Error con Supabase:", error);
      } else {
        console.log("✅ CONEXIÓN SUPABASE EXITOSA!");
        console.log(`   Registros encontrados: ${data?.length || 0}`);
        console.log("🎯 Supabase está accesible");
      }
    } else {
      console.error("❌ No hay credenciales de Supabase");
    }
  } catch (supabaseError) {
    console.error("❌ Error al importar Supabase:", supabaseError);
  }
}
  console.error("❌ ERROR EN CONEXIÓN POSTGRESQL DIRECTA:");
  console.error(`   ${error instanceof Error ? error.message : "Unknown error"}`);
  
  // Probar con Supabase como fallback
  console.log("🔄 Intentando con Supabase...");
  
  try {
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.39.0");
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const { data, error } = await supabase
        .from('persona')
        .select('*')
        .limit(1);
        
      if (error) {
        console.error("❌ Error con Supabase:", error);
      } else {
        console.log("✅ CONEXIÓN SUPABASE EXITOSA!");
        console.log(`   Registros encontrados: ${data?.length || 0}`);
        console.log("🎯 Supabase está accesible");
      }
    } else {
      console.error("❌ No hay credenciales de Supabase");
    }
  } catch (supabaseError) {
    console.error("❌ Error al probar Supabase:", supabaseError);
  }
}