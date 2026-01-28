import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { load } from "https://deno.land/std/dotenv/mod.ts";

await load({ export: true, allowEmptyValues: true });

console.log("🚀 Test de Conexión a Supabase");

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

console.log(`🔍 Variables de entorno:`);
console.log(`   SUPABASE_URL: ${supabaseUrl ? supabaseUrl.substring(0, 30) + "..." : "NO DEFINIDA"}`);
console.log(`   SUPABASE_KEY: ${supabaseKey ? supabaseKey.substring(0, 20) + "..." : "NO DEFINIDA"}`);

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Error: Variables de entorno de Supabase no definidas");
  Deno.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log("🔌 Probando conexión a Supabase...");

try {
  // Test 1: Verificar conexión básica
  const { data: versionData, error: versionError } = await supabase
    .rpc('version', {})
    .single();
    
  if (versionError) {
    console.error("❌ Error en test de versión:", versionError);
    throw versionError;
  }
  
  console.log("✅ Versión del servidor:", versionData);
  
  // Test 2: Verificar tablas
  const tables = ['persona', 'usuario', 'empresa_origen', 'plan', 'promocion', 'venta', 'linea_nueva', 'portabilidad', 'correo', 'estado_correo'];
  
  console.log("📊 Verificando tablas existentes:");
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
        
      if (error) {
        console.log(`   ❌ ${table}: ${error.message}`);
      } else {
        console.log(`   ✅ ${table}: ${data?.length || 0} registros`);
      }
    } catch (err) {
      console.log(`   ⚠️  ${table}: Error inesperado`);
    }
  }
  
  // Test 3: Intentar operación de inserción
  console.log("🧪 Probando operación de inserción...");
  
  const testPersona = {
    nombre: "Usuario",
    apellido: "Prueba",
    fecha_nacimiento: "1990-01-01",
    documento: "TEST-DOC-" + Date.now(),
    tipo_documento: "DNI",
    nacionalidad: "Argentina",
    genero: "M",
    email: `test-${Date.now()}@example.com`,
    telefono: "1122334455",
    creado_en: new Date().toISOString()
  };
  
  const { data: insertData, error: insertError } = await supabase
    .from('persona')
    .insert([testPersona])
    .select();
    
  if (insertError) {
    console.error("❌ Error en inserción:", insertError);
    throw insertError;
  }
  
  console.log("✅ Inserción exitosa:", insertData);
  
  // Test 4: Intentar operación de lectura
  console.log("🧪 Probando operación de lectura...");
  
  const { data: readData, error: readError } = await supabase
    .from('persona')
    .select('*')
    .eq('documento', testPersona.documento)
    .single();
    
  if (readError) {
    console.error("❌ Error en lectura:", readError);
    throw readError;
  }
  
  console.log("✅ Lectura exitosa:", readData);
  
  // Test 5: Intentar operación de actualización
  console.log("🧪 Probando operación de actualización...");
  
  const { data: updateData, error: updateError } = await supabase
    .from('persona')
    .update({ nombre: "Usuario Actualizado" })
    .eq('documento', testPersona.documento)
    .select();
    
  if (updateError) {
    console.error("❌ Error en actualización:", updateError);
    throw updateError;
  }
  
  console.log("✅ Actualización exitosa:", updateData);
  
  console.log("\n🎯 TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE!");
  console.log("✅ Supabase está funcionando perfectamente");
  console.log("✅ El sistema puede migrar y operar con esta conexión");
  
} catch (error) {
  console.error("\n❌ ERROR CRÍTICO EN CONEXIÓN SUPABASE:");
  console.error(`   Mensaje: ${error instanceof Error ? error.message : "Error desconocido"}`);
  
  if (error instanceof Error) {
    console.error(`   Tipo: ${error.constructor.name}`);
    if (error.message.includes("Invalid API key")) {
      console.error("   🔑 Causa probable: API key inválida o permisos insuficientes");
    }
    if (error.message.includes("Failed to fetch")) {
      console.error("   🌐 Causa probable: Error de red o URL incorrecta");
    }
  }
  
  console.error("\n📋 SOLUCIONES RECOMENDADAS:");
  console.error("   1. Verificar la URL del proyecto Supabase");
  console.error("   2. Verificar el Service Role Key");
  console.error("   3. Configurar permisos en el dashboard de Supabase");
  console.error("   4. Verificar conexión a internet");
  
  Deno.exit(1);
}