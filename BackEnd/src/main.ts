// src/main.ts
import { Application, Router } from "oak";
import { config } from "dotenv";
import client from "./database/MySQL.ts";
import routerHome from "./router/HomeRouter.ts";
import { authRouter } from "./router/AuthRouter.ts";
import { usuarioRouter } from "./router/UsuarioRouter.ts"; // ✅ Agregar si existe
import { UsuarioMySQL } from "./model/usuarioMySQL.ts";
import {
  corsMiddleware,
  errorMiddleware,
  loggerMiddleware,
  timingMiddleware,
} from "./middleware/corsMiddlewares.ts";

config({ export: true });

const app = new Application();
const PORT = Number(Deno.env.get("PORT")) || 8000;
const usuario = new UsuarioMySQL(client);

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

// ============================================
// Health Check
// ============================================
const healthRouter = new Router();
healthRouter.get("/health", (ctx) => {
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
app.use((ctx) => {
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
app.addEventListener("error", (evt) => {
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

await app.listen({ port: PORT });
