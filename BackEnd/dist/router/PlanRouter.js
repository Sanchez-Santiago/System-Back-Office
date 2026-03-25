import express from 'express';
import { PlanController } from "../Controller/PlanController";
import { PlanService } from "../services/PlanService";
import { PlanCreateSchema, PlanUpdateSchema } from "../schemas/venta/Plan";
import { authMiddleware } from "../middleware/auth.js";
import { rolMiddleware } from "../middleware/rolMiddlewares";
import { ROLES_ADMIN } from "../constants/roles";
import { mapDatabaseError } from "../Utils/databaseErrorMapper";
import { logger } from "../Utils/logger";
function getPaisByUsuario(user, pgClient) {
    if (!user.celula)
        return null;
    // Esta función se填充á dinámicamente
    return null;
}
export function planRouter(planModel, userModel, pgClient) {
    const router = express.Router();
    const planService = new PlanService(planModel);
    const planController = new PlanController(planService);
    router.get("/planes", authMiddleware(userModel), async (req, res) => {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
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
            const planes = await planController.getAll({ page, limit, pais: paisFiltro });
            res.status(200).json({
                success: true,
                data: planes,
                filtro: {
                    pais: paisFiltro,
                    rol: rol,
                },
            });
        }
        catch (error) {
            const isDev = process.env.MODO === "development";
            const mapped = mapDatabaseError(error, isDev);
            if (mapped) {
                res.status(mapped.statusCode).json({ success: false, message: mapped.message });
            }
            else {
                res.status(500).json({
                    success: false,
                    message: isDev ? error.message : "Error interno del servidor",
                    ...(isDev && { stack: error.stack })
                });
            }
        }
    });
    router.get("/planes/:id", authMiddleware(userModel), async (req, res) => {
        try {
            const { id } = req.params;
            const plan = await planController.getById({ id });
            if (!plan) {
                res.status(404).json({
                    success: false,
                    message: "Plan no encontrado",
                });
                return;
            }
            res.status(200).json({
                success: true,
                data: plan,
            });
        }
        catch (error) {
            const isDev = process.env.MODO === "development";
            const mapped = mapDatabaseError(error, isDev);
            if (mapped) {
                res.status(mapped.statusCode).json({ success: false, message: mapped.message });
            }
            else {
                res.status(500).json({
                    success: false,
                    message: isDev ? error.message : "Error interno del servidor",
                    ...(isDev && { stack: error.stack })
                });
            }
        }
    });
    router.get("/planes/empresa/:id", authMiddleware(userModel), async (req, res) => {
        try {
            const { id } = req.params;
            const plans = await planController.getByEmpresa({ empresa: id });
            res.status(200).json({
                success: true,
                data: plans,
            });
        }
        catch (error) {
            const isDev = process.env.MODO === "development";
            const mapped = mapDatabaseError(error, isDev);
            if (mapped) {
                res.status(mapped.statusCode).json({ success: false, message: mapped.message });
            }
            else {
                res.status(500).json({
                    success: false,
                    message: isDev ? error.message : "Error interno del servidor",
                    ...(isDev && { stack: error.stack })
                });
            }
        }
    });
    router.post("/planes", authMiddleware(userModel), rolMiddleware(...ROLES_ADMIN), async (req, res) => {
        try {
            logger.debug('POST /planes');
            const result = PlanCreateSchema.safeParse(req.body);
            if (!result.success) {
                logger.error('POST /planes validation error:', result.error.errors);
                res.status(400).json({
                    success: false,
                    message: "Validación fallida",
                    errors: result.error.errors.map(e => ({
                        field: e.path.join('.'),
                        message: e.message
                    })),
                    ...(process.env.MODO === "development" && {
                        stack: result.error.stack,
                        details: result.error
                    })
                });
                return;
            }
            const newPlan = await planController.create({ plan: result.data });
            const user = req.user;
            if (pgClient) {
                try {
                    const { NotificacionService } = await import("../services/NotificacionService");
                    const notifService = new NotificacionService(pgClient);
                    await notifService.notificarPlan({
                        accion: "CREAR",
                        planId: newPlan.plan_id,
                        planNombre: newPlan.nombre,
                        empresaOrigenId: newPlan.empresa_origen_id,
                        usuarioCreadorId: user.id || user.persona_id,
                    });
                }
                catch (e) {
                    logger.warn("Error enviando notificación de plan:", e);
                }
            }
            logger.info('POST /planes success:', newPlan.plan_id);
            res.status(201).json({
                success: true,
                data: newPlan,
            });
        }
        catch (error) {
            logger.error('POST /planes:', error);
            const isDev = process.env.MODO === "development";
            const mapped = mapDatabaseError(error, isDev);
            if (mapped) {
                res.status(mapped.statusCode).json({ success: false, message: mapped.message });
            }
            else {
                res.status(500).json({
                    success: false,
                    message: isDev ? error.message : "Error interno del servidor",
                    ...(isDev && { stack: error.stack })
                });
            }
        }
    });
    router.put("/planes/:id", authMiddleware(userModel), rolMiddleware(...ROLES_ADMIN), async (req, res) => {
        try {
            logger.debug('PUT /planes/:id');
            const { id } = req.params;
            const result = PlanUpdateSchema.safeParse(req.body);
            if (!result.success) {
                logger.error('PUT /planes/:id validation error:', result.error.errors);
                res.status(400).json({
                    success: false,
                    message: "Validación fallida",
                    errors: result.error.errors.map(e => ({
                        field: e.path.join('.'),
                        message: e.message
                    })),
                    ...(process.env.MODO === "development" && {
                        stack: result.error.stack,
                        details: result.error
                    })
                });
                return;
            }
            const updatedPlan = await planController.update({ id, plan: result.data });
            if (!updatedPlan) {
                res.status(404).json({
                    success: false,
                    message: "Plan no encontrado",
                });
                return;
            }
            const user = req.user;
            if (pgClient) {
                try {
                    const { NotificacionService } = await import("../services/NotificacionService");
                    const notifService = new NotificacionService(pgClient);
                    await notifService.notificarPlan({
                        accion: "ACTUALIZAR",
                        planId: updatedPlan.plan_id,
                        planNombre: updatedPlan.nombre,
                        empresaOrigenId: updatedPlan.empresa_origen_id,
                        usuarioCreadorId: user.id || user.persona_id,
                    });
                }
                catch (e) {
                    logger.warn("Error enviando notificación de plan:", e);
                }
            }
            res.status(200).json({
                success: true,
                data: updatedPlan,
            });
        }
        catch (error) {
            logger.error('PUT /planes/:id:', error);
            const isDev = process.env.MODO === "development";
            const mapped = mapDatabaseError(error, isDev);
            if (mapped) {
                res.status(mapped.statusCode).json({ success: false, message: mapped.message });
            }
            else {
                res.status(500).json({
                    success: false,
                    message: isDev ? error.message : "Error interno del servidor",
                    ...(isDev && { stack: error.stack })
                });
            }
        }
    });
    router.delete("/planes/:id", authMiddleware(userModel), rolMiddleware(...ROLES_ADMIN), async (req, res) => {
        try {
            const { id } = req.params;
            const deleted = await planController.delete({ id });
            if (!deleted) {
                res.status(404).json({
                    success: false,
                    message: "Plan no encontrado",
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: "Plan eliminado correctamente",
            });
        }
        catch (error) {
            const isDev = process.env.MODO === "development";
            const mapped = mapDatabaseError(error, isDev);
            if (mapped) {
                res.status(mapped.statusCode).json({ success: false, message: mapped.message });
            }
            else {
                res.status(500).json({
                    success: false,
                    message: isDev ? error.message : "Error interno del servidor",
                    ...(isDev && { stack: error.stack })
                });
            }
        }
    });
    // PATCH /planes/:id/activar
    router.patch("/planes/:id/activar", authMiddleware(userModel), rolMiddleware(...ROLES_ADMIN), async (req, res) => {
        try {
            const { id } = req.params;
            const user = req.user;
            const plan = await planController.getById({ id });
            if (!plan) {
                res.status(404).json({
                    success: false,
                    message: "Plan no encontrado",
                });
                return;
            }
            const updatedPlan = await planController.update({ id, plan: { activo: true } });
            // Notificar a usuarios del país
            if (pgClient) {
                try {
                    const { NotificacionService } = await import("../services/NotificacionService");
                    const notifService = new NotificacionService(pgClient);
                    await notifService.notificarPlan({
                        accion: "ACTIVAR",
                        planId: Number(id),
                        planNombre: plan.nombre,
                        empresaOrigenId: plan.empresa_origen_id,
                        usuarioCreadorId: user.id,
                    });
                }
                catch (e) {
                    logger.warn("Error enviando notificación:", e);
                }
            }
            res.status(200).json({
                success: true,
                message: "Plan activado correctamente",
                data: updatedPlan,
            });
        }
        catch (error) {
            const isDev = process.env.MODO === "development";
            res.status(500).json({
                success: false,
                message: isDev ? error.message : "Error interno del servidor",
            });
        }
    });
    // PATCH /planes/:id/desactivar
    router.patch("/planes/:id/desactivar", authMiddleware(userModel), rolMiddleware(...ROLES_ADMIN), async (req, res) => {
        try {
            const { id } = req.params;
            const user = req.user;
            const plan = await planController.getById({ id });
            if (!plan) {
                res.status(404).json({
                    success: false,
                    message: "Plan no encontrado",
                });
                return;
            }
            const updatedPlan = await planController.update({ id, plan: { activo: false } });
            // Notificar a usuarios del país
            if (pgClient) {
                try {
                    const { NotificacionService } = await import("../services/NotificacionService");
                    const notifService = new NotificacionService(pgClient);
                    await notifService.notificarPlan({
                        accion: "DESACTIVAR",
                        planId: Number(id),
                        planNombre: plan.nombre,
                        empresaOrigenId: plan.empresa_origen_id,
                        usuarioCreadorId: user.id,
                    });
                }
                catch (e) {
                    logger.warn("Error enviando notificación:", e);
                }
            }
            res.status(200).json({
                success: true,
                message: "Plan desactivado correctamente",
                data: updatedPlan,
            });
        }
        catch (error) {
            const isDev = process.env.MODO === "development";
            res.status(500).json({
                success: false,
                message: isDev ? error.message : "Error interno del servidor",
            });
        }
    });
    return router;
}
//# sourceMappingURL=PlanRouter.js.map