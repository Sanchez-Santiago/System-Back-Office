import express from 'express';
import { MensajeController } from "../Controller/MensajeController.ts";
import { MensajeService } from "../services/MensajeService.ts";
import { authMiddleware } from "../middleware/authMiddlewares.ts";
import { rolMiddleware } from "../middleware/rolMiddlewares.ts";
import { logger } from "../Utils/logger.ts";
export function mensajeRouter(mensajeModel, userModel) {
    const router = express.Router();
    const mensajeService = new MensajeService(mensajeModel);
    const mensajeController = new MensajeController(mensajeService);
    router.get("/mensajes/inbox", authMiddleware(userModel), async (req, res) => {
        try {
            const usuario_id = req.user.id;
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 20;
            const mensajes = await mensajeController.getInbox({
                usuario_id,
                page,
                limit,
            });
            res.json({
                success: true,
                data: mensajes,
                pagination: { page, limit, total: mensajes.length },
            });
        }
        catch (error) {
            logger.error("Error en GET /mensajes/inbox:", error);
            res.status(500).json({
                success: false,
                message: error instanceof Error
                    ? error.message
                    : "Error al obtener inbox",
            });
        }
    });
    router.get("/mensajes/no-leidos", authMiddleware(userModel), async (req, res) => {
        try {
            const usuario_id = req.user.id;
            const count = await mensajeController.countNoLeidos({ usuario_id });
            res.json({
                success: true,
                count,
            });
        }
        catch (error) {
            logger.error("Error en GET /mensajes/no-leidos:", error);
            res.status(500).json({
                success: false,
                message: error instanceof Error
                    ? error.message
                    : "Error al contar mensajes",
            });
        }
    });
    router.get("/mensajes/alertas-pendientes", authMiddleware(userModel), rolMiddleware("SUPERVISOR", "ADMIN", "SUPERADMIN"), async (req, res) => {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 20;
            const alertas = await mensajeController.getAlertasPendientes({
                page,
                limit,
            });
            res.json({
                success: true,
                data: alertas,
                pagination: { page, limit, total: alertas.length },
            });
        }
        catch (error) {
            logger.error("Error en GET /mensajes/alertas-pendientes:", error);
            res.status(500).json({
                success: false,
                message: error instanceof Error
                    ? error.message
                    : "Error al obtener alertas",
            });
        }
    });
    router.get("/mensajes/tipo/:tipo", authMiddleware(userModel), async (req, res) => {
        try {
            const { tipo } = req.params;
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 20;
            if (tipo !== "ALERTA" && tipo !== "NOTIFICACION") {
                res.status(400).json({
                    success: false,
                    message: "Tipo inválido. Debe ser ALERTA o NOTIFICACION",
                });
                return;
            }
            const mensajes = await mensajeController.getByTipo({
                tipo: tipo,
                page,
                limit,
            });
            res.json({
                success: true,
                data: mensajes,
                pagination: { page, limit, total: mensajes.length },
            });
        }
        catch (error) {
            logger.error("Error en GET /mensajes/tipo/:tipo:", error);
            res.status(500).json({
                success: false,
                message: error instanceof Error
                    ? error.message
                    : "Error al obtener mensajes",
            });
        }
    });
    router.get("/mensajes/referencia/:id", authMiddleware(userModel), async (req, res) => {
        try {
            const { id } = req.params;
            const referencia_id = Number(id);
            if (isNaN(referencia_id)) {
                res.status(400).json({
                    success: false,
                    message: "ID de referencia inválido",
                });
                return;
            }
            const alertas = await mensajeController.getAlertasByReferencia({
                referencia_id,
            });
            res.json({
                success: true,
                data: alertas,
            });
        }
        catch (error) {
            logger.error("Error en GET /mensajes/referencia/:id:", error);
            res.status(500).json({
                success: false,
                message: error instanceof Error
                    ? error.message
                    : "Error al obtener alertas",
            });
        }
    });
    router.get("/mensajes/:id", authMiddleware(userModel), async (req, res) => {
        try {
            const { id } = req.params;
            const mensaje_id = Number(id);
            if (isNaN(mensaje_id)) {
                res.status(400).json({
                    success: false,
                    message: "ID inválido",
                });
                return;
            }
            const mensaje = await mensajeController.getById({ mensaje_id });
            if (!mensaje) {
                res.status(404).json({
                    success: false,
                    message: "Mensaje no encontrado",
                });
                return;
            }
            res.json({
                success: true,
                data: mensaje,
            });
        }
        catch (error) {
            logger.error("Error en GET /mensajes/:id:", error);
            res.status(500).json({
                success: false,
                message: error instanceof Error
                    ? error.message
                    : "Error al obtener mensaje",
            });
        }
    });
    router.post("/mensajes", authMiddleware(userModel), async (req, res) => {
        try {
            const usuario_id = req.user.id;
            const usuario_rol = req.user.rol;
            const input = {
                ...req.body,
                usuario_creador_id: usuario_id,
            };
            const mensaje = await mensajeController.create({
                input,
                usuario_creador_rol: usuario_rol,
            });
            res.status(201).json({
                success: true,
                message: "Mensaje creado exitosamente",
                data: mensaje,
            });
        }
        catch (error) {
            logger.error("Error en POST /mensajes:", error);
            res.status(400).json({
                success: false,
                message: error instanceof Error
                    ? error.message
                    : "Error al crear mensaje",
            });
        }
    });
    router.patch("/mensajes/:id/leido", authMiddleware(userModel), async (req, res) => {
        try {
            const { id } = req.params;
            const mensaje_id = Number(id);
            const usuario_id = req.user.id;
            if (isNaN(mensaje_id)) {
                res.status(400).json({
                    success: false,
                    message: "ID inválido",
                });
                return;
            }
            const result = await mensajeController.marcarComoLeido({
                mensaje_id,
                usuario_id,
            });
            if (!result) {
                res.status(404).json({
                    success: false,
                    message: "Mensaje no encontrado o no pertenece al usuario",
                });
                return;
            }
            res.json({
                success: true,
                message: "Mensaje marcado como leído",
            });
        }
        catch (error) {
            logger.error("Error en PATCH /mensajes/:id/leido:", error);
            res.status(500).json({
                success: false,
                message: error instanceof Error
                    ? error.message
                    : "Error al marcar como leído",
            });
        }
    });
    router.patch("/mensajes/:id/resolver", authMiddleware(userModel), rolMiddleware("SUPERVISOR", "ADMIN", "SUPERADMIN"), async (req, res) => {
        try {
            const { id } = req.params;
            const mensaje_id = Number(id);
            if (isNaN(mensaje_id)) {
                res.status(400).json({
                    success: false,
                    message: "ID inválido",
                });
                return;
            }
            const mensaje = await mensajeController.resolverAlerta({
                mensaje_id,
            });
            if (!mensaje) {
                res.status(404).json({
                    success: false,
                    message: "Alerta no encontrada o ya resuelta",
                });
                return;
            }
            res.json({
                success: true,
                message: "Alerta resuelta exitosamente",
                data: mensaje,
            });
        }
        catch (error) {
            logger.error("Error en PATCH /mensajes/:id/resolver:", error);
            res.status(400).json({
                success: false,
                message: error instanceof Error
                    ? error.message
                    : "Error al resolver alerta",
            });
        }
    });
    return router;
}
//# sourceMappingURL=MensajeRouter.js.map