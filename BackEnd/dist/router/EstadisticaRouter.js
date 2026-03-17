import express from 'express';
import { authMiddleware } from "../middleware/authMiddlewares.ts";
import { rolMiddleware } from "../middleware/rolMiddlewares.ts";
import { ROLES_MANAGEMENT } from "../constants/roles.ts";
import { EstadisticaController } from "../Controller/EstadisticaController.ts";
import { EstadisticaService } from "../services/EstadisticaService.ts";
import { logger } from "../Utils/logger.ts";
export function estadisticaRouter(estadisticaModel, usuarioModel) {
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
            logger.info(`GET /estadisticas - periodo: ${periodo}, cellaId: ${cellaId}, asesorId: ${asesorId}`);
            const user = req.user;
            const filters = {
                periodo: periodo,
                cellaId,
                asesorId,
                userId: user?.persona_id,
                userRol: user?.rol,
                fechaPortacionDesde,
                fechaPortacionHasta,
            };
            const estadisticas = await estadisticaController.getEstadisticas(filters);
            res.status(200).json({
                success: true,
                data: estadisticas,
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
            logger.info(`GET /estadisticas/recargas - periodo: ${periodo}, cellaId: ${cellaId}`);
            const user = req.user;
            const filters = {
                periodo: periodo,
                cellaId,
                userId: user?.persona_id,
                userRol: user?.rol,
                fechaPortacionDesde,
                fechaPortacionHasta,
            };
            const recargas = await estadisticaController.getRecargas(filters);
            res.status(200).json({
                success: true,
                data: recargas,
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