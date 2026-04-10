import express from 'express';
import { LineaNuevaController } from "../Controller/LineaNuevaController";
import { LineaNuevaCreateSchema } from "../schemas/venta/LineaNueva";
import { authMiddleware } from "../middleware/auth.js";
import { rolMiddleware } from "../middleware/rolMiddlewares";
import { ROLES_ADMIN } from "../constants/roles";
export function lineaNuevaRouter(lineaNuevaModel, ventaModel, portabilidadModel, userModel) {
    const router = express.Router();
    const lineaNuevaController = new LineaNuevaController(lineaNuevaModel, ventaModel, portabilidadModel);
    router.get("/linea-nueva", authMiddleware(userModel), async (req, res) => {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const lineaNuevas = await lineaNuevaController.getAll({ page, limit });
            res.status(200).json({
                success: true,
                data: lineaNuevas,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    });
    router.get("/linea-nueva/:venta_id", authMiddleware(userModel), async (req, res) => {
        try {
            const venta_id = Number(req.params.venta_id);
            const lineaNueva = await lineaNuevaController.getByVenta({ venta: venta_id });
            if (!lineaNueva) {
                res.status(404).json({
                    success: false,
                    message: "Línea nueva no encontrada",
                });
                return;
            }
            res.status(200).json({
                success: true,
                data: lineaNueva,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    });
    router.post("/linea-nueva", authMiddleware(userModel), async (req, res) => {
        try {
            const result = LineaNuevaCreateSchema.safeParse(req.body.lineaNueva);
            if (!result.success) {
                res.status(400).json({
                    success: false,
                    message: `Validación fallida: ${result.error.errors.map((error) => error.message).join(", ")}`,
                });
                return;
            }
            const newLineaNueva = await lineaNuevaController.create({ lineaNueva: result.data });
            res.status(201).json({
                success: true,
                data: newLineaNueva,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    });
    router.put("/linea-nueva/:venta_id", authMiddleware(userModel), rolMiddleware(...ROLES_ADMIN), async (req, res) => {
        try {
            const venta_id = Number(req.params.venta_id);
            const result = LineaNuevaCreateSchema.partial().safeParse(req.body.lineaNueva);
            if (!result.success) {
                res.status(400).json({
                    success: false,
                    message: `Validación fallida: ${result.error.errors.map((error) => error.message).join(", ")}`,
                });
                return;
            }
            const updatedLineaNueva = await lineaNuevaController.update({ id: venta_id, lineaNueva: result.data });
            if (!updatedLineaNueva) {
                res.status(404).json({
                    success: false,
                    message: "Línea nueva no encontrada",
                });
                return;
            }
            res.status(200).json({
                success: true,
                data: updatedLineaNueva,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    });
    router.delete("/linea-nueva/:venta_id", authMiddleware(userModel), rolMiddleware(...ROLES_ADMIN), async (req, res) => {
        try {
            const venta_id = Number(req.params.venta_id);
            const deleted = await lineaNuevaController.delete({ id: venta_id });
            if (!deleted) {
                res.status(404).json({
                    success: false,
                    message: "Línea nueva no encontrada",
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: "Línea nueva eliminada correctamente",
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    });
    router.get("/linea-nueva/estadisticas", authMiddleware(userModel), async (req, res) => {
        try {
            const stats = await lineaNuevaController.getStatistics();
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
    router.get("/linea-nueva/estado/:estado", authMiddleware(userModel), async (req, res) => {
        try {
            const { estado } = req.params;
            const lineaNuevas = await lineaNuevaController.getByEstado({ estado });
            res.status(200).json({
                success: true,
                data: lineaNuevas,
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
//# sourceMappingURL=LineaNuevaRouter.js.map