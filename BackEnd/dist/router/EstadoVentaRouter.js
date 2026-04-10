import express from 'express';
import { EstadoVentaController } from "../Controller/EstadoVentaController";
import { EstadoVentaService } from "../services/EstadoVentaService";
import { authMiddleware } from "../middleware/auth.js";
import { rolMiddleware } from "../middleware/rolMiddlewares";
export function estadoVentaRouter(estadoVentaModel, userModel) {
    const router = express.Router();
    const estadoVentaService = new EstadoVentaService(estadoVentaModel);
    const estadoVentaController = new EstadoVentaController(estadoVentaService);
    router.get("/estados", authMiddleware(userModel), async (req, res) => {
        await estadoVentaController.getAll(req, res);
    });
    router.get("/estados/ultimos", authMiddleware(userModel), async (req, res) => {
        await estadoVentaController.getAllLastEstado(req, res);
    });
    router.get("/estados/buscar", authMiddleware(userModel), async (req, res) => {
        await estadoVentaController.getByMultipleFilters(req, res);
    });
    router.get("/estados/por-fecha", authMiddleware(userModel), async (req, res) => {
        await estadoVentaController.getByFechaRango(req, res);
    });
    router.get("/estados/tipo/:estado", authMiddleware(userModel), async (req, res) => {
        await estadoVentaController.getByEstado(req, res);
    });
    router.get("/estados/venta/:venta_id", authMiddleware(userModel), async (req, res) => {
        await estadoVentaController.getByVentaId(req, res);
    });
    router.get("/estados/venta/:venta_id/ultimo", authMiddleware(userModel), async (req, res) => {
        await estadoVentaController.getLastByVentaId(req, res);
    });
    router.get("/estados/:id", authMiddleware(userModel), async (req, res) => {
        await estadoVentaController.getById(req, res);
    });
    router.post("/estados", authMiddleware(userModel), rolMiddleware("SUPER_ADMIN", "ADMIN", "BACK_OFFICE"), async (req, res) => {
        try {
            const body = req.body;
            if (req.user && req.user.id) {
                body.usuario_id = req.user.id;
            }
            await estadoVentaController.create(req, res);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Error al procesar la solicitud",
            });
        }
    });
    router.put("/estados/:id", authMiddleware(userModel), rolMiddleware("SUPER_ADMIN", "ADMIN", "BACK_OFFICE"), async (req, res) => {
        await estadoVentaController.update(req, res);
    });
    router.delete("/estados/:id", authMiddleware(userModel), rolMiddleware("SUPER_ADMIN", "ADMIN"), async (req, res) => {
        await estadoVentaController.delete(req, res);
    });
    router.post("/estados/bulk", authMiddleware(userModel), rolMiddleware("SUPERADMIN", "ADMIN", "BACK_OFFICE"), async (req, res) => {
        await estadoVentaController.bulkCreate(req, res);
    });
    return router;
}
//# sourceMappingURL=EstadoVentaRouter.js.map