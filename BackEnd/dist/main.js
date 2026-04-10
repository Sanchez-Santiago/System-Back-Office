// src/main.ts
// ============================================
// Punto de entrada principal de la aplicación System-Back-Office
// Migrado de Deno Oak a Node.js Express
// ============================================
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PostgresClient } from './database/PostgreSQL';
import { logger } from './Utils/logger';
if (!process.env.POSTGRES_URL) {
    throw new Error('❌ Configuración PostgreSQL requerida. ' +
        'Configura POSTGRES_URL en tu archivo .env');
}
export const pgClient = new PostgresClient();
let dbConnected = false;
try {
    logger.info('🔄 Iniciando conexión a PostgreSQL...');
    await pgClient.connect();
    dbConnected = true;
    logger.info('✅ Conexión PostgreSQL establecida exitosamente');
}
catch (error) {
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
import { MensajePostgreSQL } from './model/mensajePostgreSQL';
import { ComentarioPostgreSQL } from './model/comentarioPostgreSQL';
import { CelulaPostgreSQL } from './model/celulaPostgreSQL';
import { EstadisticaPostgreSQL } from './model/estadisticaPostgreSQL';
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
import routerHome from './router/HomeRouter';
const app = express();
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
app.use((err, req, res, next) => {
    logger.error('Error no manejado:', err);
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
    });
});
app.get('/health', (req, res) => {
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
// app.use(actualizarRouter(estadoCorreoModel, estadoVentaModel, ventaModel, correoModel, usuarioModel));
// app.use(mensajeRouter(mensajeModel, usuarioModel));
// app.use(comentarioRouter(comentarioModel, usuarioModel));
// app.use(celulaRouter(celulaController, usuarioModel));
// app.use(estadisticaRouter(estadisticaModel, usuarioModel, pgClient));
// app.use(aiChatRouter(chatModel, estadisticaModel, ventaModel, usuarioModel));
app.use((req, res) => {
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
//# sourceMappingURL=main.js.map