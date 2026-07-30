// src/main.ts
// ============================================
// Punto de entrada principal de la aplicación System-Back-Office
// Migrado de Deno Oak a Node.js Express
// ============================================

import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { PostgresClient } from './database/PostgreSQL';
import { logger } from './Utils/logger';

if (!process.env.POSTGRES_URL) {
  throw new Error(
    '❌ Configuración PostgreSQL requerida. ' +
      'Configura POSTGRES_URL en tu archivo .env',
  );
}

export const pgClient = new PostgresClient();

let dbConnected = false;

try {
  logger.info('🔄 Iniciando conexión a PostgreSQL...');
  await pgClient.connect();
  dbConnected = true;
  logger.info('✅ Conexión PostgreSQL establecida exitosamente');
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  logger.error('❌ Error crítico al conectar PostgreSQL:', errorMessage);
  logger.warn('⚠️ Aplicación iniciada SIN conexión a base de datos');
  dbConnected = false;
}

import { UsuarioPostgreSQL } from './model/usuarioPostgreSQL';
import { VentaPostgreSQL } from './model/ventaPostgreSQL';
import { EstadoVentaPostgreSQL } from './model/estadoVentaPostgreSQL';
import { CorreoPostgreSQL } from './model/correoPostgreSQL';
import { EstadoCorreoPostgreSQL } from './model/estadoCorreoPostgreSQL';
import { PlanPostgreSQL } from './model/planPostgreSQL';
import { PromocionPostgreSQL } from './model/promocionPostgreSQL';
import { ClientePostgreSQL } from './model/clientePostgreSQL';
import { LineaNuevaPostgreSQL } from './model/lineaNuevaPostgreSQL';
import { PortabilidadPostgreSQL } from './model/portabilidadPostgreSQL';
import { EmpresaOrigenPostgreSQL } from './model/empresaOrigenPostgreSQL';
import { MensajePostgreSQL } from './model/MensajePostgreSQL';
import { ComentarioPostgreSQL } from './model/ComentarioPostgreSQL';
import { CelulaPostgreSQL } from './model/celulaPostgreSQL';
import { EstadisticaPostgreSQL } from './model/EstadisticaPostgreSQL';
import { ChatPostgreSQL } from './model/chatPostgreSQL';
import { CelulaService } from './services/CelulaService';
import { CelulaController } from './Controller/CelulaController';

const usuarioModel = new UsuarioPostgreSQL(pgClient);
const ventaModel = new VentaPostgreSQL(pgClient);
const estadoVentaModel = new EstadoVentaPostgreSQL(pgClient);
const correoModel = new CorreoPostgreSQL(pgClient);
const estadoCorreoModel = new EstadoCorreoPostgreSQL(pgClient);
const planModel = new PlanPostgreSQL(pgClient);
const promocionModel = new PromocionPostgreSQL(pgClient);
const clienteModel = new ClientePostgreSQL(pgClient);
const lineaNuevaModel = new LineaNuevaPostgreSQL(pgClient);
const portabilidadModel = new PortabilidadPostgreSQL(pgClient);
const empresaOrigenModel = new EmpresaOrigenPostgreSQL(pgClient);
const mensajeModel = new MensajePostgreSQL(pgClient);
const comentarioModel = new ComentarioPostgreSQL(pgClient);
const celulaModel = new CelulaPostgreSQL(pgClient);
const estadisticaModel = new EstadisticaPostgreSQL(pgClient);
const chatModel = new ChatPostgreSQL(pgClient);
const celulaService = new CelulaService(celulaModel);
const celulaController = new CelulaController(celulaService);

logger.info('🚀 Models PostgreSQL instanciados correctamente');

// Auto-seed demo user on startup
(async () => {
  if (!dbConnected) {
    logger.warn('⚠️ No se pudo conectar a la DB, omitiendo seed del usuario demo');
    return;
  }
  try {
    const { AuthController } = await import('./Controller/AuthController');
    const { UsuarioCreateSchema } = await import('./schemas/persona/User');
    const authCtrl = new AuthController(usuarioModel);
    const existing = await usuarioModel.getByEmail({ email: 'demo@florhub.com' });
    if (existing) {
      logger.info('✅ Usuario demo ya existe, omitiendo seed');
      return;
    }
    const demoUser = {
      nombre: 'DEMO',
      apellido: 'SUPERADMIN',
      documento: '99999999',
      tipo_documento: 'DNI',
      nacionalidad: 'ARGENTINA',
      email: 'demo@florhub.com',
      fecha_nacimiento: '2000-01-01',
      telefono: '+549999999999',
      genero: 'OTRO',
      legajo: 'DEMO0',
      rol: 'SUPERADMIN' as const,
      permisos: ['SUPERADMIN', 'ADMIN', 'BACK_OFFICE', 'SUPERVISOR', 'VENDEDOR'],
      exa: 'EXADEMO',
      password_hash: 'Demo2024!',
      celula: 1,
      estado: 'ACTIVO' as const,
    };
    const validated = UsuarioCreateSchema.parse(demoUser);
    await authCtrl.register({ user: validated });
    logger.info('✅ Usuario demo creado: demo@florhub.com / Demo2024!');
  } catch (error) {
    logger.error('❌ Error al crear usuario demo:', error);
  }
})();

import { authRouter } from './router/AuthRouter';
import { usuarioRouter } from './router/UsuarioRouter';
import { ventaRouter } from './router/VentaRouter';
import { estadoVentaRouter } from './router/EstadoVentaRouter';
import { correoRouter } from './router/CorreoRouter';
import { estadoCorreoRouter } from './router/EstadoCorreoRouter';
import { planRouter } from './router/PlanRouter';
import { promocionRouter } from './router/PromocionRouter';
import { clienteRouter } from './router/ClienteRouter';
import { lineaNuevaRouter } from './router/LineaNuevaRouter';
import { portabilidadRouter } from './router/PortabilidadRouter';
import { empresaOrigenRouter } from './router/EmpresaOrigenRouter';
import { actualizarRouter } from './router/ActulizarRouter';
import { mensajeRouter } from './router/MensajeRouter';
import { comentarioRouter } from './router/ComentarioRouter';
import routerHome from './router/HomeRouter';
import { celulaRouter } from './router/CelulaRouter';
import { estadisticaRouter } from './router/EstadisticaRouter';
import { aiChatRouter } from './router/AIChatRouter';
import { corsMiddleware, errorMiddleware } from './middleware/corsMiddlewares';

const app = express();

app.use(helmet());
app.use(compression());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Demasiadas solicitudes. Intenta de nuevo en 15 minutos.' },
});
app.use(limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'Cookie'],
  credentials: true,
  maxAge: 86400,
}));

app.use((err: Error, req: Request, res: Response, next: any) => {
  logger.error('Error no manejado:', err);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
  });
});

app.get('/health', (req: Request, res: Response) => {
  const dbConnected = pgClient.isConnected();

  const status = dbConnected ? 'healthy' : 'degraded';

  res.status(dbConnected ? 200 : 503).json({
    success: dbConnected,
    status,
    message: dbConnected
      ? 'Servidor saludable'
      : 'Servidor con problemas de conexión a base de datos',
    timestamp: new Date().toISOString(),
    uptime: performance.now(),
    database: {
      connected: dbConnected,
      type: 'PostgreSQL/Supabase'
    }
  });
});

app.use(routerHome);
app.use(authRouter(usuarioModel));
app.use(usuarioRouter(usuarioModel));
app.use(correoRouter(correoModel, usuarioModel));
app.use(estadoCorreoRouter(estadoCorreoModel, usuarioModel));
app.use(planRouter(planModel, usuarioModel, pgClient));
app.use(promocionRouter(promocionModel, usuarioModel, pgClient));
app.use(ventaRouter(ventaModel, usuarioModel, correoModel, lineaNuevaModel, portabilidadModel, clienteModel, planModel, promocionModel, estadoVentaModel, pgClient));
app.use(estadoVentaRouter(estadoVentaModel, usuarioModel));
app.use(empresaOrigenRouter(empresaOrigenModel, usuarioModel, pgClient));
app.use(lineaNuevaRouter(lineaNuevaModel, ventaModel, portabilidadModel, usuarioModel));
app.use(portabilidadRouter(portabilidadModel, ventaModel, lineaNuevaModel, usuarioModel));
app.use(clienteRouter(clienteModel, usuarioModel));
app.use(actualizarRouter(estadoCorreoModel, estadoVentaModel, ventaModel, correoModel, usuarioModel));
app.use(mensajeRouter(mensajeModel, usuarioModel));
app.use(comentarioRouter(comentarioModel, usuarioModel));
app.use(celulaRouter(celulaController, usuarioModel));
app.use(estadisticaRouter(estadisticaModel, usuarioModel, pgClient));
app.use(aiChatRouter(chatModel, estadisticaModel, ventaModel, clienteModel, portabilidadModel, lineaNuevaModel, usuarioModel));

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint no encontrado',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  });
});

const port = parseInt(process.env.PORT || '8000');

logger.info('🚀 Iniciando servidor System-Back-Office');
logger.info(`   🌐 Puerto: http://localhost:${port}`);
logger.info(`   🐘 Base de datos: PostgreSQL`);

app.listen(port, () => {
  logger.info('✅ Servidor iniciado exitosamente');
});
