import { Application, Context, Router } from "oak";
/**
 * Punto de entrada principal de la aplicación System-Back-Office
 *
 * Este archivo configura y inicializa:
 * - Variables de entorno
 * - Conexión a base de datos MySQL
 * - Middlewares de seguridad (CORS, autenticación)
 * - Rutas de API para todas las entidades
 * - Servidor HTTP con Oak
 *
 * @author Equipo de Desarrollo System-Back-Office
 */

import { config } from "dotenv";
import { logger } from "./Utils/logger.ts";
import client from "./database/MySQL.ts";
import { createMySQLTesterFromEnv } from "./database/connectionTest.ts";
import { healthChecker } from "./database/healthCheck.ts";
import routerHome from "./router/HomeRouter.ts";
import { authRouter } from "./router/AuthRouter.ts";
import { usuarioRouter } from "./router/UsuarioRouter.ts";
import { correoRouter } from "./router/CorreoRouter.ts";
import { estadoCorreoRouter } from "./router/EstadoCorreoRouter.ts";
import { planRouter } from "./router/PlanRouter.ts";
import { promocionRouter } from "./router/PromocionRouter.ts";
import { ventaRouter } from "./router/VentaRouter.ts";
import { clienteRouter } from "./router/ClienteRouter.ts";
import { lineaNuevaRouter } from "./router/LineaNuevaRouter.ts";
import { portabilidadRouter } from "./router/PortabilidadRouter.ts";
import { estadoVentaRouter } from "./router/EstadoVentaRouter.ts";
import { empresaOrigenRouter } from "./router/EmpresaOrigenRouter.ts";
import { UsuarioMySQL } from "./model/usuarioMySQL.ts";
import { CorreoMySQL } from "./model/correoMySQL.ts";
import { EstadoCorreoMySQL } from "./model/estadoCorreoMySQL.ts";
import { PlanMySQL } from "./model/planMySQL.ts";
import { PromocionMySQL } from "./model/promocionMySQL.ts";
import { VentaMySQL } from "./model/ventaMySQL.ts";
import { ClienteMySQL } from "./model/clienteMySQL.ts";
import { LineaNuevaMySQL } from "./model/lineaNuevaMySQL.ts";
import { PortabilidadMySQL } from "./model/portabilidadMySQL.ts";
import { EmpresaOrigenMySQL } from "./model/empresaOrigenMySQL.ts";
import {
  corsMiddleware,
  errorMiddleware,
  loggerMiddleware,
  timingMiddleware,
} from "./middleware/corsMiddlewares.ts";

// ============================================
// Configuración de Variables de Entorno
// ============================================
/**
 * Carga las variables de entorno desde .env
 * Exporta las variables al entorno global de Deno
 */
config({ export: true });

// ============================================
// Prueba de Conexión a Base de Datos
// ============================================
/**
 * Realiza una prueba de conexión a la base de datos MySQL
 * antes de iniciar el servidor para detectar problemas temprano
 */
async function performDatabaseConnectionTest(): Promise<boolean> {
  const connectionTestEnabled = Deno.env.get("DB_CONNECTION_TEST_ENABLED") !== "false";
  
  if (!connectionTestEnabled) {
    logger.info("⚠️  Prueba de conexión a BD deshabilitada via DB_CONNECTION_TEST_ENABLED=false");
    return true;
  }

  try {
    logger.info("================================");
    logger.info("🔍 Realizando prueba de conexión a la base de datos...");
    
    const tester = createMySQLTesterFromEnv();
    
    // Configuración para la prueba
    const testOptions = {
      timeout: Number(Deno.env.get("DB_CONNECTION_TIMEOUT")) || 10000,
      retries: Number(Deno.env.get("DB_CONNECTION_RETRIES")) || 3,
      retryDelay: Number(Deno.env.get("DB_CONNECTION_RETRY_DELAY")) || 2000,
      verbose: Deno.env.get("MODO") === "development"
    };

    logger.debug(`⚙️  Configuración de prueba: timeout=${testOptions.timeout}ms, retries=${testOptions.retries}`);
    
    // Realizar prueba completa
    const result = await tester.testFullConnection(testOptions);
    
    // Formatear y mostrar resultado
    const formattedResult = tester.formatResult(result);
    logger.info(formattedResult);

    if (!result.success) {
      logger.error("❌ La prueba de conexión a la base de datos FALLÓ");
      
      // Determinar si debemos continuar o detenernos
      const failFast = Deno.env.get("DB_CONNECTION_FAIL_FAST") !== "false";
      
      if (failFast) {
        logger.error("🛑 Deteniendo inicio de la aplicación debido a fallo de conexión");
        logger.error("   Para continuar de todas formas, establece DB_CONNECTION_FAIL_FAST=false");
        Deno.exit(1);
      } else {
        logger.warn("⚠️  Continuando con el inicio a pesar del fallo de conexión");
        logger.warn("   Es probable que la aplicación no funcione correctamente");
      }
    } else {
      logger.info("✅ Prueba de conexión a base de datos completada exitosamente");
      
      // Verificar tablas críticas si está habilitado
      const checkTables = Deno.env.get("DB_CHECK_CRITICAL_TABLES") !== "false";
      if (checkTables) {
        await checkCriticalTables(tester);
      }
    }
    
    return result.success;

  } catch (error) {
    logger.error("❌ Error crítico durante la prueba de conexión a la base de datos");
    logger.error(error);
    
    const failFast = Deno.env.get("DB_CONNECTION_FAIL_FAST") !== "false";
    if (failFast) {
      logger.error("🛑 Deteniendo aplicación debido a error crítico");
      Deno.exit(1);
    }
    
    return false;
  }
}

/**
 * Verifica la existencia de tablas críticas para la aplicación
 */
async function checkCriticalTables(tester: ReturnType<typeof createMySQLTesterFromEnv>): Promise<void> {
  try {
    logger.info("📋 Verificando tablas críticas de la aplicación...");
    
    const criticalTables = [
      "usuario",
      "persona", 
      "password",
      "celula",
      "permisos",
      "venta",
      "cliente"
    ];
    
    const result = await tester.checkCriticalTables(criticalTables);
    
    if (result.success) {
      logger.info("✅ Todas las tablas críticas existen");
      
      const details = result.details as any;
      if (details?.checkedCount) {
        logger.info(`📊 Tablas verificadas: ${details.checkedCount}/${criticalTables.length}`);
      }
    } else {
      logger.warn("⚠️  Algunas tablas críticas faltan");
      logger.warn(result.message);
      
      const details = result.details as any;
      if (details?.missingTables?.length > 0) {
        logger.warn(`🚨 Tablas faltantes: ${details.missingTables.join(", ")}`);
      }
    }
    
  } catch (error) {
    logger.error("❌ Error verificando tablas críticas");
    logger.error(error);
  }
}

const app = new Application();
const PORT = Number(Deno.env.get("PORT")) || 8000;

// ============================================
// Prueba de Conexión ANTES de Inicializar Modelos
// ============================================
// Realizamos la prueba de conexión antes de crear cualquier modelo
// para detectar problemas temprano y evitar errores en el startup
await performDatabaseConnectionTest();

// ============================================
// Instanciación de Modelos de Base de Datos
// ============================================
/**
 * Crea instancias de los modelos MySQL para acceder a datos
 * Cada modelo maneja operaciones CRUD para su entidad correspondiente
 */
const usuario = new UsuarioMySQL(client);
const correo = new CorreoMySQL(client);
const estadoCorreo = new EstadoCorreoMySQL(client);
const plan = new PlanMySQL(client);
const promocion = new PromocionMySQL(client);
const venta = new VentaMySQL(client);
const cliente = new ClienteMySQL(client);
const lineaNueva = new LineaNuevaMySQL(client);
const portabilidad = new PortabilidadMySQL(client);
const empresaOrigen = new EmpresaOrigenMySQL(client);

// ============================================
// Middlewares Globales (ORDEN IMPORTANTE)
// ============================================
/**
 * Configura los middlewares que se aplican a todas las rutas
 * El orden es crítico para el correcto funcionamiento:
 * 1. Error Handler: Captura excepciones no manejadas
 * 2. CORS: Permite requests cross-origin
 * 3. Logger: Registra todas las requests (desarrollo)
 */

// 1. Error Handler (debe ir primero para capturar todos los errores)
app.use(errorMiddleware);

// 2. CORS (debe ir antes de los routers para permitir preflight)
app.use(corsMiddleware);

// 3. Logger (opcional)
app.use(loggerMiddleware);

// 4. Timing (opcional, debe ir después de logger)
app.use(timingMiddleware);

// ============================================
// Configuración de Rutas de API
// ============================================
/**
 * Registra todos los routers de la aplicación
 * Cada router maneja un conjunto de endpoints para una entidad específica
 * Los routers incluyen middleware de autenticación y validación
 */

// Router Home (endpoints básicos de salud del sistema)
app.use(routerHome.routes());
app.use(routerHome.allowedMethods());

// Router Auth
const authRouterInstance = authRouter(usuario);
app.use(authRouterInstance.routes());
app.use(authRouterInstance.allowedMethods());

// Router Usuario
const usuarioRouterInstance = usuarioRouter(usuario);
app.use(usuarioRouterInstance.routes());
app.use(usuarioRouterInstance.allowedMethods());

// ✅ NUEVO: Router Correo
const correoRouterInstance = correoRouter(correo, usuario);
app.use(correoRouterInstance.routes());
app.use(correoRouterInstance.allowedMethods());

// Router EstadoCorreo
const estadoCorreoRouterInstance = estadoCorreoRouter(estadoCorreo, usuario);
app.use(estadoCorreoRouterInstance.routes());
app.use(estadoCorreoRouterInstance.allowedMethods());

// Router Plan
const planRouterInstance = planRouter(plan, usuario);
app.use(planRouterInstance.routes());
app.use(planRouterInstance.allowedMethods());

// Router Promocion
const promocionRouterInstance = promocionRouter(promocion, usuario);
app.use(promocionRouterInstance.routes());
app.use(promocionRouterInstance.allowedMethods());

// Router Venta
const ventaRouterInstance = ventaRouter(
  venta,
  usuario,
  correo,
  lineaNueva,
  portabilidad,
  cliente,
  plan,
  promocion,
);
app.use(ventaRouterInstance.routes());
app.use(ventaRouterInstance.allowedMethods());

// Router Estado Venta
const estadoVentaRouterInstance = estadoVentaRouter(usuario);
app.use(estadoVentaRouterInstance.routes());
app.use(estadoVentaRouterInstance.allowedMethods());

// Router Empresa Origen
const empresaOrigenRouterInstance = empresaOrigenRouter(usuario);
app.use(empresaOrigenRouterInstance.routes());
app.use(empresaOrigenRouterInstance.allowedMethods());

// Router Linea Nueva
const lineaNuevaRouterInstance = lineaNuevaRouter(
  lineaNueva,
  venta,
  portabilidad,
  usuario,
);
app.use(lineaNuevaRouterInstance.routes());
app.use(lineaNuevaRouterInstance.allowedMethods());

// Router Portabilidad
const portabilidadRouterInstance = portabilidadRouter(
  portabilidad,
  venta,
  lineaNueva,
  usuario,
);
app.use(portabilidadRouterInstance.routes());
app.use(portabilidadRouterInstance.allowedMethods());

// Router Cliente
const clienteRouterInstance = clienteRouter(cliente, usuario);
app.use(clienteRouterInstance.routes());
app.use(clienteRouterInstance.allowedMethods());

// ============================================
// Health Check
// ============================================
const healthRouter = new Router();

// Health check básico (existente)
healthRouter.get("/health", async (ctx: Context) => {
  try {
    const result = await healthChecker.performBasicHealthCheck();
    ctx.response.status = 200;
    ctx.response.body = result;
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = {
      status: "ERROR",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error)
    };
  }
});

// Health check completo (nuevo)
healthRouter.get("/health/full", async (ctx: Context) => {
  try {
    const result = await healthChecker.performFullHealthCheck();
    
    // Determinar código HTTP basado en el estado
    let statusCode = 200;
    if (result.status === "degraded") {
      statusCode = 200; // Degraded todavía responde con 200 pero indica estado
    } else if (result.status === "unhealthy") {
      statusCode = 503; // Service Unavailable
    }
    
    ctx.response.status = statusCode;
    ctx.response.body = result;
  } catch (error) {
    ctx.response.status = 503;
    ctx.response.body = {
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
      services: [],
      summary: { total: 0, healthy: 0, degraded: 0, unhealthy: 1 }
    };
  }
});

// Health check específico de base de datos
healthRouter.get("/health/db", async (ctx: Context) => {
  try {
    const dbHealth = await healthChecker.checkDatabaseHealth();
    
    let statusCode = 200;
    if (dbHealth.status === "degraded") {
      statusCode = 200;
    } else if (dbHealth.status === "unhealthy") {
      statusCode = 503;
    }
    
    ctx.response.status = statusCode;
    ctx.response.body = dbHealth;
  } catch (error) {
    ctx.response.status = 503;
    ctx.response.body = {
      name: "database",
      status: "unhealthy",
      message: error instanceof Error ? error.message : String(error),
      lastCheck: new Date().toISOString()
    };
  }
});

// Health check específico del sistema
healthRouter.get("/health/system", async (ctx: Context) => {
  try {
    const systemHealth = await healthChecker.checkSystemHealth();
    ctx.response.status = 200;
    ctx.response.body = systemHealth;
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = {
      name: "system",
      status: "degraded",
      message: error instanceof Error ? error.message : String(error),
      lastCheck: new Date().toISOString()
    };
  }
});

app.use(healthRouter.routes());
app.use(healthRouter.allowedMethods());

// ============================================
// 404 Handler (debe ir al final)
// ============================================
app.use((ctx: Context) => {
  ctx.response.status = 404;
  ctx.response.body = {
    success: false,
    message: "Ruta no encontrada",
    path: ctx.request.url.pathname,
    method: ctx.request.method,
  };
});

// ============================================
// Event Listeners
// ============================================
app.addEventListener("error", (evt: ErrorEvent) => {
  console.error("❌ [APP ERROR]", evt.error);
});

// ============================================
// Inicialización y Arranque del Servidor
// ============================================
/**
 * Inicia el servidor HTTP con configuración completa
 * Muestra información de configuración y estado
 * Maneja el ciclo de vida de la aplicación
 */
logger.info("================================");
logger.info(`🚀 Servidor iniciado en http://localhost:${PORT}`);
logger.info(`📝 Modo: ${Deno.env.get("MODO")}`);
logger.info(
  `🌐 CORS: ${
    Deno.env.get("MODO") === "production" ? "Restringido" : "Abierto (*)"
  }`,
);
logger.info(
  `🔒 JWT Secret: ${
    Deno.env.get("JWT_SECRET") ? "Configurado ✅" : "NO CONFIGURADO ❌"
  }`,
);
logger.info("✉️  Router Correo: Activado ✅");

await app.listen({ port: PORT });
