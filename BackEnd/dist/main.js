// src/main.ts
// ============================================
// Punto de entrada principal de la aplicación System-Back-Office
// Migrado de Deno Oak a Node.js Express
// ============================================
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PostgresClient } from './database/PostgreSQL.ts';
import { logger } from './Utils/logger.ts';
if (!process.env.POSTGRES_URL) {
    throw new Error('❌ Configuración PostgreSQL requerida. ' +
        'Configura POSTGRES_URL en tu archivo .env');
}
const pgClient = new PostgresClient();
try {
    logger.info('🔄 Iniciando conexión a PostgreSQL...');
    await pgClient.connect();
    logger.info('✅ Conexión PostgreSQL establecida exitosamente');
}
catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('❌ Error crítico al conectar PostgreSQL:', errorMessage);
    logger.info('🔄 Aplicación continuando en modo limitado');
}
import { UsuarioPostgreSQL } from './model/usuarioPostgreSQL.ts';
import { VentaPostgreSQL } from './model/ventaPostgreSQL.ts';
import { EstadoVentaPostgreSQL } from './model/estadoVentaPostgreSQL.ts';
import { CorreoPostgreSQL } from './model/correoPostgreSQL.ts';
import { EstadoCorreoPostgreSQL } from './model/estadoCorreoPostgreSQL.ts';
import { PlanPostgreSQL } from './model/planPostgreSQL.ts';
import { PromocionPostgreSQL } from './model/promocionPostgreSQL.ts';
import { ClientePostgreSQL } from './model/clientePostgreSQL.ts';
import { LineaNuevaPostgreSQL } from './model/lineaNuevaPostgreSQL.ts';
import { PortabilidadPostgreSQL } from './model/portabilidadPostgreSQL.ts';
import { EmpresaOrigenPostgreSQL } from './model/empresaOrigenPostgreSQL.ts';
import { MensajePostgreSQL } from './model/MensajePostgreSQL.ts';
import { ComentarioPostgreSQL } from './model/ComentarioPostgreSQL.ts';
import { CelulaPostgreSQL } from './model/celulaPostgreSQL.ts';
import { EstadisticaPostgreSQL } from './model/EstadisticaPostgreSQL.ts';
import { CelulaService } from './services/CelulaService.ts';
import { CelulaController } from './Controller/CelulaController.ts';
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
const celulaService = new CelulaService(celulaModel);
const celulaController = new CelulaController(celulaService);
logger.info('🚀 Models PostgreSQL instanciados correctamente');
import { authRouter } from './router/AuthRouter.ts';
import { usuarioRouter } from './router/UsuarioRouter.ts';
import { ventaRouter } from './router/VentaRouter.ts';
import { estadoVentaRouter } from './router/EstadoVentaRouter.ts';
import { correoRouter } from './router/CorreoRouter.ts';
import { estadoCorreoRouter } from './router/EstadoCorreoRouter.ts';
import { planRouter } from './router/PlanRouter.ts';
import { promocionRouter } from './router/PromocionRouter.ts';
import { clienteRouter } from './router/ClienteRouter.ts';
import { lineaNuevaRouter } from './router/LineaNuevaRouter.ts';
import { portabilidadRouter } from './router/PortabilidadRouter.ts';
import { empresaOrigenRouter } from './router/EmpresaOrigenRouter.ts';
import { actualizarRouter } from './router/ActulizarRouter.ts';
import { mensajeRouter } from './router/MensajeRouter.ts';
import { comentarioRouter } from './router/ComentarioRouter.ts';
import routerHome from './router/HomeRouter.ts';
import { celulaRouter } from './router/CelulaRouter.ts';
import { estadisticaRouter } from './router/EstadisticaRouter.ts';
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
    res.status(200).json({
        success: true,
        message: 'Servidor saludable',
        timestamp: new Date().toISOString(),
        uptime: performance.now(),
    });
});
app.use(routerHome);
app.use(authRouter(usuarioModel));
app.use(usuarioRouter(usuarioModel));
app.use(correoRouter(correoModel, usuarioModel));
app.use(estadoCorreoRouter(estadoCorreoModel, usuarioModel));
app.use(planRouter(planModel, usuarioModel));
app.use(promocionRouter(promocionModel, usuarioModel));
app.use(ventaRouter(ventaModel, usuarioModel, correoModel, lineaNuevaModel, portabilidadModel, clienteModel, planModel, promocionModel, estadoVentaModel));
app.use(estadoVentaRouter(estadoVentaModel, usuarioModel));
app.use(empresaOrigenRouter(empresaOrigenModel, usuarioModel));
app.use(lineaNuevaRouter(lineaNuevaModel, ventaModel, portabilidadModel, usuarioModel));
app.use(portabilidadRouter(portabilidadModel, ventaModel, lineaNuevaModel, usuarioModel));
app.use(clienteRouter(clienteModel, usuarioModel));
app.use(actualizarRouter(estadoCorreoModel, estadoVentaModel, ventaModel, correoModel, usuarioModel));
app.use(mensajeRouter(mensajeModel, usuarioModel));
app.use(comentarioRouter(comentarioModel, usuarioModel));
app.use(celulaRouter(celulaController, usuarioModel));
app.use(estadisticaRouter(estadisticaModel, usuarioModel));
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