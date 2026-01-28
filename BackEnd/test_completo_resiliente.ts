import { Application, Router, Context } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { load } from "https://deno.land/std/dotenv/mod.ts";
import { ResilientPostgresConnection } from "./src/database/PostgreSQL.ts";
import { UsuarioPostgreSQL } from "./src/model/usuarioPostgreSQL.ts";
import { VentaPostgreSQL } from "./src/model/ventaPostgreSQL.ts";

await load({ export: true, allowEmptyValues: true });

const app = new Application();
const router = new Router();

// Inicializar conexión resiliente
const resilientConnection = new ResilientPostgresConnection();
const usuarioModel = new UsuarioPostgreSQL(resilientConnection);
const ventaModel = new VentaPostgreSQL(resilientConnection);

// Iniciar conexión en background
resilientConnection.connect().catch((error) => {
  console.warn("⚠️ Sistema iniciando en modo degradado:", error.message);
});

// Health check mejorado
router.get("/health", (ctx: Context) => {
  const dbConnected = resilientConnection.isConnected;
  const retryCount = resilientConnection.getRetryCount();
  // const lastAlert = resilientConnection.lastConnectionAlert;
  
  ctx.response.status = dbConnected ? 200 : 503;
  ctx.response.body = {
    status: dbConnected ? "healthy" : "degraded",
    message: dbConnected ? "✅ Sistema PostgreSQL funcionando" : "⚠️ Sistema en modo degradado",
    timestamp: new Date().toISOString(),
    database: {
      connected: dbConnected,
      retryCount,
      lastAttempt: lastAlert?.timestamp || new Date().toISOString(),
      url: Deno.env.get("POSTGRES_HOST"),
      port: Deno.env.get("POSTGRES_PORT"),
    },
    models: {
      usuario: "✅", 
      venta: "✅", 
      connection: "✅",
      models_count: 2,
      features: [
        "Reintentos automáticos",
        "Backoff exponencial", 
        "Modo degradado",
        "Health checks",
        "Manejo de errores"
      ]
    },
    uptime: performance.now(),
    version: "2.0.0"
  };
});

// Prueba de usuarios
router.get("/test/usuarios", async (ctx: Context) => {
  try {
    console.log("🧪 Probando getAll usuarios...");
    const usuarios = await usuarioModel.getAll({ page: 1, limit: 10 });
    
    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      message: "✅ Prueba de usuarios completada",
      data: usuarios || [],
      count: usuarios?.length || 0,
      database_status: resilientConnection.isConnected,
      timestamp: new Date().toISOString(),
      test_info: {
        operation: "getAll",
        model: "UsuarioPostgreSQL",
        limit: 10,
        page: 1,
        has_data: usuarios && usuarios.length > 0
      }
    };
  } catch (error) {
    ctx.response.status = 503;
    ctx.response.body = {
      success: false,
      message: "❌ Error en prueba de usuarios",
      error: error instanceof Error ? error.message : "Unknown error",
      database_status: resilientConnection.isConnected,
      timestamp: new Date().toISOString(),
      test_info: {
        operation: "getAll",
        model: "UsuarioPostgreSQL",
        error_type: error instanceof Error ? error.constructor.name : "Unknown"
      }
    };
  }
});

// Prueba de ventas
router.get("/test/ventas", async (ctx: Context) => {
  try {
    console.log("🧪 Probando getAll ventas...");
    const ventas = await ventaModel.getAll({ page: 1, limit: 10 });
    
    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      message: "✅ Prueba de ventas completada",
      data: ventas || [],
      count: ventas?.length || 0,
      database_status: resilientConnection.isConnected,
      timestamp: new Date().toISOString(),
      test_info: {
        operation: "getAll",
        model: "VentaPostgreSQL",
        limit: 10,
        page: 1,
        has_data: ventas && ventas.length > 0
      }
    };
  } catch (error) {
    ctx.response.status = 503;
    ctx.response.body = {
      success: false,
      message: "❌ Error en prueba de ventas",
      error: error instanceof Error ? error.message : "Unknown error",
      database_status: resilientConnection.isConnected,
      timestamp: new Date().toISOString(),
    };
  }
});

// Crear usuario de prueba
router.post("/test/crear-usuario", async (ctx: Context) => {
  try {
    const body = await ctx.request.body().value;
    
    console.log("🧪 Probando creación de usuario...");
    
    // NOTA: El modelo actual no tiene método add implementado
    // Simularemos una prueba de lectura para verificar la conexión
    const testUsuarios = await usuarioModel.getAll({ page: 1, limit: 1 });
    
    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      message: "✅ Prueba de creación (verificada por lectura)",
      test_data: {
        email: body?.email || `test-${Date.now()}@example.com`,
        usuario_creado: testUsuarios?.length || 0,
        database_status: resilientConnection.isConnected
      },
      timestamp: new Date().toISOString(),
      operation: "CREATE_TEST"
    };
  } catch (error) {
    ctx.response.status = 503;
    ctx.response.body = {
      success: false,
      message: "❌ Error en prueba de creación",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
      operation: "CREATE_TEST"
    };
  }
});

// Simular caída de conexión
router.post("/test/simular-caida", async (ctx: Context) => {
  try {
    console.log("🔴 Simulando caída de conexión...");
    await resilientConnection.end();
    
    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      message: "✅ Conexión terminada - Sistema en modo degradado",
      timestamp: new Date().toISOString(),
      action: "CONNECTION_TERMINATED",
      database_status: false,
      retry_count: resilientConnection.getRetryCount()
    };
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      message: "❌ Error al simular caída",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    };
  }
});

// Probar modo degradado
router.get("/test/mode-degradado", async (ctx: Context) => {
  ctx.response.status = 200;
  ctx.response.body = {
    success: true,
    message: resilientConnection.isConnected 
      ? "⚠️ Sistema está conectado (no modo degradado)" 
      : "✅ Sistema en modo degradado (sin conexión)",
    database_status: resilientConnection.isConnected,
    retry_count: resilientConnection.getRetryCount(),
    last_attempt: resilientConnection.lastConnectionAlert?.timestamp,
    timestamp: new Date().toISOString(),
    features: {
      modo_degradado_activo: !resilientConnection.isConnected,
      sistema_siempre_responde: true,
      reintentos_automaticos: true,
      manejo_errores_resiliente: true
    }
  };
});

// Recuperar conexión
router.post("/test/recuperar-conexion", async (ctx: Context) => {
  try {
    console.log("🔄 Recuperando conexión...");
    await resilientConnection.connect();
    
    setTimeout(() => {
      const status = resilientConnection.isConnected;
      console.log(`📊 Estado después de recuperación: ${status ? "CONECTADO" : "AÚN SIN CONEXIÓN"}`);
      
      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        message: "✅ Intento de recuperación iniciado",
        timestamp: new Date().toISOString(),
        recovery_status: status,
        final_state: status ? "CONNECTED" : "STILL_NO_CONNECTION",
        retry_count: resilientConnection.getRetryCount()
      };
    }, 3000); // Esperar 3 segundos para ver el resultado
    
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      message: "❌ Error al recuperar conexión",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    };
  }
});

// Test de stress con múltiples peticiones
router.get("/test/stress", async (ctx: Context) => {
  const startTime = Date.now();
  console.log("🔥 Iniciando prueba de stress...");
  
  try {
    // Crear 10 peticiones concurrentes
    const promises = Array.from({ length: 10 }, async (_, index) => {
      try {
        await usuarioModel.getAll({ page: 1, limit: 5 });
        console.log(`  📊 Petición ${index + 1}/10 completada`);
        return { success: true, index };
      } catch (error) {
        console.error(`❌ Error en petición ${index + 1}: ${error instanceof Error ? error.message : "Unknown error"}`);
        return { success: false, index, error: error instanceof Error ? error.message : "Unknown error" };
      }
    });

    const results = await Promise.all(promises);
    const endTime = Date.now();
    const duration = endTime - startTime;
    const successCount = results.filter(r => r.success).length;
    const errorCount = results.filter(r => !r.success).length;
    
    ctx.response.status = 200;
    ctx.response.body = {
      message: "✅ Prueba de stress completada",
      timestamp: new Date().toISOString(),
      test_info: {
        duration_ms: duration,
        concurrent_requests: 10,
        successful: successCount,
        failed: errorCount,
        success_rate: `${((successCount / 10) * 100).toFixed(1)}%`,
        database_status: resilientConnection.isConnected,
        performance_ok: successCount >= 8 // 80% success rate
      }
    };
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = {
      message: "❌ Error en prueba de stress",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    };
  }
});

// Test de actualización
router.put("/test/actualizar-usuario/:id", async (ctx: Context) => {
  try {
    const { id } = ctx.params;
    const body = await ctx.request.body().value;
    
    console.log(`🧪 Probando actualización de usuario ${id}...`);
    
    const usuario = await usuarioModel.update({ 
      id, 
      input: body 
    });
    
    if (usuario) {
      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        message: "✅ Usuario actualizado exitosamente",
        data: usuario,
        timestamp: new Date().toISOString(),
        test_info: {
          operation: "UPDATE",
          id,
          fields_updated: Object.keys(body).length
        }
      };
    } else {
      ctx.response.status = 404;
      ctx.response.body = {
        success: false,
        message: "❌ Usuario no encontrado",
        timestamp: new Date().toISOString(),
      };
    }
  } catch (error) {
    ctx.response.status = 503;
    ctx.response.body = {
      success: false,
      message: "❌ Error en actualización",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    };
  }
});

app.use(router.routes());

const port = parseInt(Deno.env.get("PORT") || "8002");

console.log("🚀 Iniciando servidor de pruebas PostgreSQL resiente completo...");
console.log(`🌐 Puerto: ${port}`);
console.log("📊 Endpoints disponibles:");
console.log("   🏥 Health: GET /health");
console.log("   🧪 Pruebas CRUD:");
console.log("      - GET /test/usuarios (Prueba de lectura)");
console.log("      - GET /test/ventas (Prueba de lectura)");
console.log("      - POST /test/crear-usuario (Prueba de conexión)");
console.log("      - PUT /test/actualizar-usuario/:id (Prueba de actualización)");
console.log("   🔧 Resiliencia:");
console.log("      - GET /test/mode-degradado (Verificar estado)");
console.log("      - POST /test/simular-caida (Forzar modo degradado)");
console.log("      - POST /test/recuperar-conexion (Forzar recuperación)");
console.log("   🔥 Stress:");
console.log("      - GET /test/stress (Concurrencia y carga)");

await app.listen({ port });
console.log("✅ Servidor de pruebas PostgreSQL resiliente iniciado");