import { Application, Router, Context, Next } from "oak";
import { config } from "dotenv";
import client from "./database/MySQL.ts";
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

config({ export: true });

const app = new Application();
const PORT = Number(Deno.env.get("PORT")) || 8000;

// ============================================
// Modelos
// ============================================
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

// 1. Error Handler (debe ir primero para capturar todos los errores)
app.use(errorMiddleware);

// 2. CORS (debe ir antes de los routers)
app.use(corsMiddleware);

// 3. Logger (opcional)
app.use(loggerMiddleware);

// 4. Timing (opcional, debe ir después de logger)
app.use(timingMiddleware);

// ============================================
// Routers
// ============================================

// Router Home
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
const ventaRouterInstance = ventaRouter(venta, usuario, correo, lineaNueva, portabilidad, cliente, plan, promocion);
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
const lineaNuevaRouterInstance = lineaNuevaRouter(lineaNueva, venta, portabilidad, usuario);
app.use(lineaNuevaRouterInstance.routes());
app.use(lineaNuevaRouterInstance.allowedMethods());

// Router Portabilidad
const portabilidadRouterInstance = portabilidadRouter(portabilidad, venta, lineaNueva, usuario);
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
healthRouter.get("/health", (ctx: Context) => {
  ctx.response.status = 200;
  ctx.response.body = {
    status: "OK",
    timestamp: new Date().toISOString(),
    mode: Deno.env.get("MODO"),
  };
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
// Iniciar Servidor
// ============================================
console.log("================================");
console.log(`🚀 Servidor iniciado en http://localhost:${PORT}`);
console.log(`📝 Modo: ${Deno.env.get("MODO")}`);
console.log(
  `🌐 CORS: ${
    Deno.env.get("MODO") === "production" ? "Restringido" : "Abierto (*)"
  }`,
);
console.log(
  `🔒 JWT Secret: ${
    Deno.env.get("JWT_SECRET") ? "Configurado ✅" : "NO CONFIGURADO ❌"
  }`,
);
console.log("✉️  Router Correo: Activado ✅");

await app.listen({ port: PORT });
