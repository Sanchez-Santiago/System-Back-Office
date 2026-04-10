import express from 'express';
import { PortabilidadController } from "../Controller/PortabilidadController";
import { PortabilidadCreateSchema, PortabilidadUpdateSchema } from "../schemas/venta/Portabilidad";
import { authMiddleware } from "../middleware/auth.js";
import { rolMiddleware } from "../middleware/rolMiddlewares";
import { ROLES_ADMIN } from "../constants/roles";
export function portabilidadRouter(portabilidadModel, ventaModel, lineaNuevaModel, userModel) {
    const router = express.Router();
    const portabilidadController = new PortabilidadController(portabilidadModel, ventaModel, lineaNuevaModel);
    router.get("/portabilidad", authMiddleware(userModel), async (req, res) => {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const portabilidades = await portabilidadController.getAll({ page, limit });
            res.status(200).json({
                success: true,
                data: portabilidades,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    });
    router.get("/portabilidad/:venta_id", authMiddleware(userModel), async (req, res) => {
        try {
            const venta_id = Number(req.params.venta_id);
            const portabilidad = await portabilidadController.getByVenta({ venta: venta_id });
            if (!portabilidad) {
                res.status(404).json({
                    success: false,
                    message: "Portabilidad no encontrada",
                });
                return;
            }
            res.status(200).json({
                success: true,
                data: portabilidad,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    });
    router.post("/portabilidad", authMiddleware(userModel), async (req, res) => {
        try {
            const result = PortabilidadCreateSchema.safeParse(req.body.portabilidad);
            if (!result.success) {
                res.status(400).json({
                    success: false,
                    message: `Validación fallida: ${result.error.errors.map((error) => error.message).join(", ")}`,
                });
                return;
            }
            const newPortabilidad = await portabilidadController.create({ portabilidad: result.data });
            res.status(201).json({
                success: true,
                data: newPortabilidad,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    });
    router.put("/portabilidad/:venta_id", authMiddleware(userModel), rolMiddleware(...ROLES_ADMIN), async (req, res) => {
        try {
            const venta_id = Number(req.params.venta_id);
            const result = PortabilidadUpdateSchema.safeParse(req.body.portabilidad);
            if (!result.success) {
                res.status(400).json({
                    success: false,
                    message: `Validación fallida: ${result.error.errors.map((error) => error.message).join(", ")}`,
                });
                return;
            }
            const updatedPortabilidad = await portabilidadController.update({ id: venta_id, portabilidad: result.data });
            if (!updatedPortabilidad) {
                res.status(404).json({
                    success: false,
                    message: "Portabilidad no encontrada",
                });
                return;
            }
            res.status(200).json({
                success: true,
                data: updatedPortabilidad,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    });
    router.delete("/portabilidad/:venta_id", authMiddleware(userModel), rolMiddleware(...ROLES_ADMIN), async (req, res) => {
        try {
            const venta_id = Number(req.params.venta_id);
            const deleted = await portabilidadController.delete({ id: venta_id });
            if (!deleted) {
                res.status(404).json({
                    success: false,
                    message: "Portabilidad no encontrada",
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: "Portabilidad eliminada correctamente",
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    });
    router.get("/portabilidad/estadisticas", authMiddleware(userModel), async (req, res) => {
        try {
            const stats = await portabilidadController.getStatistics();
            res.status(200).json({
                success: true,
                data: stats,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    });
    router.get("/portabilidad/estado/:estado", authMiddleware(userModel), async (req, res) => {
        try {
            const { estado } = req.params;
            const portabilidades = await portabilidadController.getByEstado({ estado });
            res.status(200).json({
                success: true,
                data: portabilidades,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    });
    return router;
}
//# sourceMappingURL=PortabilidadRouter.js.map