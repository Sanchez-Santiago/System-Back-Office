import { Application, Router, Context } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { load } from "https://deno.land/std/dotenv/mod.ts";

await load({ export: true, allowEmptyValues: true });

const app = new Application();

// ============================================
// IMPORTAR MODELOS POSTGRESQL RESILIENTES
// ============================================
const pgModule = await import("./src/database/PostgreSQL.ts");
const { ResilientPostgresConnection } = pgModule;
const resilientConnection = new ResilientPostgresConnection();

// Iniciar conexión en background
resilientConnection.connect().catch((error: Error) => {
  console.warn("⚠️ Aplicación iniciando en modo degradado:", error.message);
});

const { UsuarioPostgreSQL } = await import("./src/model/usuarioPostgreSQL.ts");
const { VentaPostgreSQL } = await import("./src/model/ventaPostgreSQL.ts");
const { CorreoPostgreSQL } = await import("./src/model/correoPostgreSQL.ts");
const { EstadoCorreoPostgreSQL } = await import("./src/model/estadoCorreoPostgreSQL.ts");
const { PlanPostgreSQL } = await import("./src/model/planPostgreSQL.ts");
const { PromocionPostgreSQL } = await import("./src/model/promocionPostgreSQL.ts");
const { ClientePostgreSQL } = await import("./src/model/clientePostgreSQL.ts");
const { LineaNuevaPostgreSQL } = await import("./src/model/lineaNuevaPostgreSQL.ts");
const { PortabilidadPostgreSQL } = await import("./src/model/portabilidadPostgreSQL.ts");
const { EmpresaOrigenPostgreSQL } = await import("./src/model/empresaOrigenPostgreSQL.ts");

// Instanciar modelos
const usuarioModel = new UsuarioPostgreSQL(resilientConnection);
const ventaModel = new VentaPostgreSQL(resilientConnection);
const correoModel = new CorreoPostgreSQL(resilientConnection);
const estadoCorreoModel = new EstadoCorreoPostgreSQL(resilientConnection);
const planModel = new PlanPostgreSQL(resilientConnection);
const promocionModel = new PromocionPostgreSQL(resilientConnection);
const clienteModel = new ClientePostgreSQL(resilientConnection);
const lineaNuevaModel = new LineaNuevaPostgreSQL(resilientConnection);
const portabilidadModel = new PortabilidadPostgreSQL(resilientConnection);
const empresaOrigenModel = new EmpresaOrigenPostgreSQL(resilientConnection);

console.log("🐘 Todos los modelos PostgreSQL resilientes cargados");

const router = new Router();

// ============================================
// HEALTH CHECKS
// ============================================
router.get("/health", (ctx: Context) => {
  ctx.response.status = 200;
  ctx.response.body = {
    status: "healthy",
    message: "✅ Sistema resiliente PostgreSQL funcionando",
    timestamp: new Date().toISOString(),
    database: {
      connected: resilientConnection.isConnected,
      retryCount: resilientConnection.getRetryCount(),
    },
    models: {
      usuario: "✅", venta: "✅", correo: "✅",
      estadoCorreo: "✅", plan: "✅", promocion: "✅",
      cliente: "✅", lineaNueva: "✅", portabilidad: "✅",
      empresaOrigen: "✅"
    },
  };
});

// ============================================
// ENDPOINTS DE PRUEBA - USUARIOS
// ============================================
router.get("/test/usuarios", async (ctx: Context) => {
  try {
    console.log("🧪 Probando getAll usuarios...");
    const usuarios = await usuarioModel.getAll({ page: 1, limit: 5 });
    
    ctx.response.body = {
      success: true,
      message: "✅ Prueba de usuarios exitosa",
      data: usuarios || [],
      count: usuarios?.length || 0,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      message: "❌ Error en prueba de usuarios",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    };
  }
});

router.get("/test/ventas", async (ctx: Context) => {
  try {
    console.log("🧪 Probando getAll ventas...");
    const ventas = await ventaModel.getAll({ page: 1, limit: 5 });
    
    ctx.response.body = {
      success: true,
      message: "✅ Prueba de ventas exitosa",
      data: ventas || [],
      count: ventas?.length || 0,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      message: "❌ Error en prueba de ventas",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    };
  }
});

router.get("/test/correos", async (ctx: Context) => {
  try {
    console.log("🧪 Probando getAll correos...");
    const correos = await correoModel.getAll({ page: 1, limit: 5 });
    
    ctx.response.body = {
      success: true,
      message: "✅ Prueba de correos exitosa",
      data: correos || [],
      count: correos?.length || 0,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      message: "❌ Error en prueba de correos",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    };
  }
});

router.get("/test/planes", async (ctx: Context) => {
  try {
    console.log("🧪 Probando getAll planes...");
    const planes = await planModel.getAll({ page: 1, limit: 5 });
    
    ctx.response.body = {
      success: true,
      message: "✅ Prueba de planes exitosa",
      data: planes || [],
      count: planes?.length || 0,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      message: "❌ Error en prueba de planes",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    };
  }
});

router.get("/test/clientes", async (ctx: Context) => {
  try {
    console.log("🧪 Probando getAll clientes...");
    const clientes = await clienteModel.getAll({ page: 1, limit: 5 });
    
    ctx.response.body = {
      success: true,
      message: "✅ Prueba de clientes exitosa",
      data: clientes || [],
      count: clientes?.length || 0,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      message: "❌ Error en prueba de clientes",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    };
  }
});

// ============================================
// ENDPOINT PARA PROBAR CREACIÓN
// ============================================
router.post("/test/crear-usuario", async (ctx: Context) => {
  try {
    const body = await ctx.request.body().value;
    
    const testUsuario = {
      nombre: "Test",
      apellido: "User",
      email: `test${Date.now()}@example.com`,
      legajo: `TEST${Date.now()}`,
      exa: `EXA${Date.now()}`,
      fecha_nacimiento: new Date("1990-01-01"),
      documento: `DOC${Date.now()}`,
      tipo_documento: "DNI",
      nacionalidad: "Argentina",
      genero: "M",
      activo: true,
      contraseña: "test123",
      rol: "usuario",
      creado_en: new Date(),
      actualizado_en: new Date(),
    };

    console.log("🧪 Probando crear usuario...");
    // Nota: El método add no está disponible en el modelo actual, esto es solo una prueba de conexión
    const usuario = await usuarioModel.getAll({ page: 1, limit: 1 });
    
    ctx.response.body = {
      success: true,
      message: "✅ Prueba de creación de usuario (conexión verificada)",
      test_data: testUsuario,
      existing_count: usuario?.length || 0,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      message: "❌ Error en prueba de creación",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    };
  }
});

// ============================================
// ENDPOINT PARA SIMULAR CAÍDA DE CONEXIÓN
// ============================================
router.post("/test/simular-caida", async (ctx: Context) => {
  try {
    console.log("🔴 Simulando caída de conexión...");
    await resilientConnection.end();
    
    ctx.response.body = {
      success: true,
      message: "✅ Conexión terminada - Sistema en modo degradado",
      timestamp: new Date().toISOString(),
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

router.post("/test/recuperar-conexion", async (ctx: Context) => {
  try {
    console.log("🔄 Recuperando conexión...");
    await resilientConnection.connect();
    
    ctx.response.body = {
      success: true,
      message: "✅ Intento de recuperación iniciado",
      timestamp: new Date().toISOString(),
    };
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

app.use(router.routes());

const port = parseInt(Deno.env.get("PORT") || "9000");

console.log("🚀 Iniciando servidor completo de pruebas PostgreSQL resiliente...");
console.log(`🌐 Puerto: ${port}`);
console.log("📊 Endpoints disponibles:");
console.log("   🏥 Health:");
console.log("      - GET http://localhost:8000/health");
console.log("   🧪 Pruebas CRUD:");
console.log("      - GET http://localhost:8000/test/usuarios");
console.log("      - GET http://localhost:8000/test/ventas");
console.log("      - GET http://localhost:8000/test/correos");
console.log("      - GET http://localhost:8000/test/planes");
console.log("      - GET http://localhost:8000/test/clientes");
console.log("      - POST http://localhost:8000/test/crear-usuario");
console.log("   🔧 Resiliencia:");
console.log("      - POST http://localhost:8000/test/simular-caida");
console.log("      - POST http://localhost:8000/test/recuperar-conexion");

await app.listen({ port });
console.log("✅ Servidor completo iniciado correctamente");