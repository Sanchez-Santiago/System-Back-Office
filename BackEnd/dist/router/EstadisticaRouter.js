import express from 'express';
import { authMiddleware } from "../middleware/auth.js";
import { rolMiddleware } from "../middleware/rolMiddlewares";
import { ROLES_MANAGEMENT } from "../constants/roles";
import { EstadisticaController } from "../Controller/EstadisticaController";
import { EstadisticaService } from "../services/EstadisticaService";
import { logger } from "../Utils/logger";
export function estadisticaRouter(estadisticaModel, usuarioModel, _pgClient) {
    const router = express.Router();
    const estadisticaService = new EstadisticaService(estadisticaModel);
    const estadisticaController = new EstadisticaController(estadisticaService);
    router.get("/estadisticas", authMiddleware(usuarioModel), rolMiddleware(...ROLES_MANAGEMENT), async (req, res) => {
        try {
            const periodo = req.query.periodo || "MES";
            const cellaId = req.query.cellaId;
            const asesorId = req.query.asesorId;
            const fechaPortacionDesde = req.query.fechaPortacionDesde;
            const fechaPortacionHasta = req.query.fechaPortacionHasta;
            const paisParam = req.query.pais;
            const user = req.user;
            const rol = user?.rol?.toUpperCase();
            const esAdmin = rol === 'ADMIN' || rol === 'SUPERADMIN';
            let paisFiltro;
            if (esAdmin && paisParam) {
                paisFiltro = paisParam;
            }
            else if (!esAdmin) {
                // El pais_venta ya viene precargado en el usuario por el authMiddleware -> UsuarioPostgreSQL.getById
                paisFiltro = user?.pais_venta || undefined;
            }
            logger.info(`GET /estadisticas - periodo: ${periodo}, cellaId: ${cellaId}, asesorId: ${asesorId}, pais: ${paisFiltro}`);
            const filters = {
                periodo: periodo,
                cellaId,
                asesorId,
                userId: user?.persona_id,
                userRol: user?.rol,
                fechaPortacionDesde,
                fechaPortacionHasta,
                pais: paisFiltro,
            };
            const estadisticas = await estadisticaController.getEstadisticas(filters);
            res.status(200).json({
                success: true,
                data: estadisticas,
                filtro: {
                    pais: paisFiltro,
                    rol: rol,
                }
            });
        }
        catch (error) {
            logger.error("GET /estadisticas:", error);
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : "Error al obtener estadísticas",
            });
        }
    });
    router.get("/estadisticas/recargas", authMiddleware(usuarioModel), rolMiddleware(...ROLES_MANAGEMENT), async (req, res) => {
        try {
            const periodo = req.query.periodo || "MES";
            const cellaId = req.query.cellaId;
            const fechaPortacionDesde = req.query.fechaPortacionDesde;
            const fechaPortacionHasta = req.query.fechaPortacionHasta;
            const paisParam = req.query.pais;
            const user = req.user;
            const rol = user?.rol?.toUpperCase();
            const esAdmin = rol === 'ADMIN' || rol === 'SUPERADMIN';
            let paisFiltro;
            if (esAdmin && paisParam) {
                paisFiltro = paisParam;
            }
            else if (!esAdmin) {
                paisFiltro = user?.pais_venta || undefined;
            }
            logger.info(`GET /estadisticas/recargas - periodo: ${periodo}, cellaId: ${cellaId}, pais: ${paisFiltro}`);
            const filters = {
                periodo: periodo,
                cellaId,
                userId: user?.persona_id,
                userRol: user?.rol,
                fechaPortacionDesde,
                fechaPortacionHasta,
                pais: paisFiltro,
            };
            const recargas = await estadisticaController.getRecargas(filters);
            res.status(200).json({
                success: true,
                data: recargas,
                filtro: {
                    pais: paisFiltro,
                    rol: rol,
                }
            });
        }
        catch (error) {
            logger.error("GET /estadisticas/recargas:", error);
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : "Error al obtener recargas",
            });
        }
    });
    return router;
}
//# sourceMappingURL=EstadisticaRouter.js.map