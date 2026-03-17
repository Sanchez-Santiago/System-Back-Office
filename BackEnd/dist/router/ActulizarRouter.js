import express from 'express';
import { ActualizarController } from "../Controller/ActualizarController.ts";
import { ActualizarService } from "../services/ActualizarService.ts";
import { parseUploadedFile } from "../Utils/Csv.ts";
import { logger } from "../Utils/logger.ts";
import { authMiddleware } from "../middleware/authMiddlewares.ts";
import { rolMiddleware } from "../middleware/rolMiddlewares.ts";
import { ROLES_MANAGEMENT } from "../constants/roles.ts";
export function actualizarRouter(estadoCorreoModel, estadoVentaModel, ventaModel, correoModel, userModel) {
    const actualizarService = new ActualizarService(estadoCorreoModel, estadoVentaModel, ventaModel);
    const actualizarController = new ActualizarController(estadoCorreoModel, estadoVentaModel, ventaModel, correoModel, actualizarService);
    const router = express.Router();
    router.post("/actualizar/correo", authMiddleware(userModel), rolMiddleware(...ROLES_MANAGEMENT), async (req, res) => {
        try {
            const file = req.file;
            if (!file) {
                res.status(400).json({
                    success: false,
                    message: "No se subió ningún archivo",
                });
                return;
            }
            const parsedData = await parseUploadedFile(file);
            const count = await actualizarController.actualizarEstadoCorreo(parsedData);
            res.status(200).json({
                success: true,
                message: `Se actualizaron ${count} correos`,
            });
        }
        catch (error) {
            logger.error("Error en /actualizar/correo:", error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : "Error interno",
            });
        }
    });
    router.post("/actualizar/estado-venta", authMiddleware(userModel), rolMiddleware(...ROLES_MANAGEMENT), async (req, res) => {
        try {
            const file = req.file;
            if (!file) {
                res.status(400).json({
                    success: false,
                    message: "No se subió ningún archivo",
                });
                return;
            }
            const parsedData = await parseUploadedFile(file);
            const count = await actualizarController.actualizarEstadoVenta(parsedData);
            console.log(count);
            res.status(200).json({
                success: true,
                message: `Se actualizaron ${count} estados de venta`,
            });
        }
        catch (error) {
            logger.error("Error en /actualizar/estado-venta:", error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : "Error interno",
            });
        }
    });
    router.post("/actualizar/seguimiento-linea", authMiddleware(userModel), rolMiddleware(...ROLES_MANAGEMENT), async (req, res) => {
        try {
            const file = req.file;
            if (!file) {
                res.status(400).json({
                    success: false,
                    message: "No se subió ningún archivo",
                });
                return;
            }
            const parsedData = await parseUploadedFile(file);
            const count = await actualizarController.actualizarSegumientoLinea(parsedData);
            res.status(200).json({
                success: true,
                message: `Se actualizaron ${count} seguimientos de línea`,
            });
        }
        catch (error) {
            logger.error("Error en /actualizar/seguimiento-linea:", error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : "Error interno",
            });
        }
    });
    return router;
}
//# sourceMappingURL=ActulizarRouter.js.map