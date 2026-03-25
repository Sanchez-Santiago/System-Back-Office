import express from 'express';
import { authMiddleware } from "../middleware/auth.js";
import { rolMiddleware } from "../middleware/rolMiddlewares";
import { ROLES_MANAGEMENT } from "../constants/roles";
import { EstadisticaController } from "../Controller/EstadisticaController";
import { EstadisticaService } from "../services/EstadisticaService";
import { logger } from "../Utils/logger";
export function estadisticaRouter(estadisticaModel, usuarioModel, pgClient) {
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
            const permisos = user?.permisos || [];
            const esAdmin = rol === 'ADMIN' || rol === 'SUPERADMIN' || permisos.includes('SUPERADMIN');
            let paisFiltro;
            if (esAdmin) {
                if (paisParam) {
                    paisFiltro = paisParam;
                }
            }
            else if (user?.celula) {
                const client = pgClient?.getClient();
                if (client) {
                    try {
                        const result = await client.queryObject(`SELECT c.pais_venta FROM celula c WHERE c.id_celula = $1`, [user.celula]);
                        const paisCelula = result.rows[0]?.pais_venta;
                        if (paisCelula) {
                            paisFiltro = paisCelula;
                        }
                        else if (paisParam) {
                            paisFiltro = paisParam;
                        }
                    }
                    catch (e) {
                        logger.warn("Error obteniendo país de célula:", e);
                    }
                }
            }
            else if (paisParam) {
                paisFiltro = paisParam;
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
            const permisos = user?.permisos || [];
            const esAdmin = rol === 'ADMIN' || rol === 'SUPERADMIN' || permisos.includes('SUPERADMIN');
            let paisFiltro;
            if (esAdmin) {
                if (paisParam) {
                    paisFiltro = paisParam;
                }
            }
            else if (user?.celula) {
                const client = pgClient?.getClient();
                if (client) {
                    try {
                        const result = await client.queryObject(`SELECT c.pais_venta FROM celula c WHERE c.id_celula = $1`, [user.celula]);
                        const paisCelula = result.rows[0]?.pais_venta;
                        if (paisCelula) {
                            paisFiltro = paisCelula;
                        }
                        else if (paisParam) {
                            paisFiltro = paisParam;
                        }
                    }
                    catch (e) {
                        logger.warn("Error obteniendo país de célula:", e);
                    }
                }
            }
            else if (paisParam) {
                paisFiltro = paisParam;
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