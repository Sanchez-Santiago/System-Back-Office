import express from 'express';
import { authMiddleware } from "../middleware/authMiddlewares.ts";
import { rolMiddleware } from "../middleware/rolMiddlewares.ts";
import { ROLES_ADMIN, ROLES_MANAGEMENT } from "../constants/roles.ts";
import { CelulaCreateSchema, CelulaUpdateSchema } from "../schemas/venta/Celula.ts";
import { logger } from "../Utils/logger.ts";
export function celulaRouter(celulaController, userModel) {
    const router = express.Router();
    router.get("/celulas", authMiddleware(userModel), rolMiddleware(...ROLES_MANAGEMENT), async (req, res) => {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            logger.info(`GET /celulas - Página: ${page}, Límite: ${limit}`);
            const celulas = await celulaController.getAll({ page, limit });
            res.status(200).json({
                success: true,
                data: celulas,
                pagination: {
                    page,
                    limit,
                    total: celulas.length,
                },
            });
        }
        catch (error) {
            logger.error("GET /celulas:", error);
            res.status(400).json({
                success: false,
                message: error instanceof Error
                    ? error.message
                    : "Error al obtener células",
            });
        }
    });
    router.get("/celulas/:id", authMiddleware(userModel), rolMiddleware(...ROLES_MANAGEMENT), async (req, res) => {
        try {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({
                    success: false,
                    message: "ID de célula requerido",
                });
                return;
            }
            logger.info(`GET /celulas/${id}`);
            const celula = await celulaController.getById({ id: Number(id) });
            if (!celula) {
                res.status(404).json({
                    success: false,
                    message: "Célula no encontrada",
                });
                return;
            }
            res.status(200).json({
                success: true,
                data: celula,
            });
        }
        catch (error) {
            logger.error("GET /celulas/:id:", error);
            res.status(400).json({
                success: false,
                message: error instanceof Error
                    ? error.message
                    : "Error al obtener célula",
            });
        }
    });
    router.get("/celulas/:id/asesores", authMiddleware(userModel), rolMiddleware(...ROLES_MANAGEMENT), async (req, res) => {
        try {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({
                    success: false,
                    message: "ID de célula requerido",
                });
                return;
            }
            logger.info(`GET /celulas/${id}/asesores`);
            const celula = await celulaController.getById({ id: Number(id) });
            if (!celula) {
                res.status(404).json({
                    success: false,
                    message: "Célula no encontrada",
                });
                return;
            }
            const asesores = await celulaController.getAsesoresByCelula({ id_celula: Number(id) });
            res.status(200).json({
                success: true,
                data: asesores,
                count: asesores.length,
            });
        }
        catch (error) {
            logger.error("GET /celulas/:id/asesores:", error);
            res.status(400).json({
                success: false,
                message: error instanceof Error
                    ? error.message
                    : "Error al obtener asesores",
            });
        }
    });
    router.get("/celulas/empresa/:empresa", authMiddleware(userModel), rolMiddleware(...ROLES_MANAGEMENT), async (req, res) => {
        try {
            const { empresa } = req.params;
            if (!empresa) {
                res.status(400).json({
                    success: false,
                    message: "ID de empresa requerido",
                });
                return;
            }
            logger.info(`GET /celulas/empresa/${empresa}`);
            const celulas = await celulaController.getByEmpresa({ empresa: Number(empresa) });
            res.status(200).json({
                success: true,
                data: celulas,
                count: celulas.length,
            });
        }
        catch (error) {
            logger.error("GET /celulas/empresa/:empresa:", error);
            res.status(400).json({
                success: false,
                message: error instanceof Error
                    ? error.message
                    : "Error al obtener células",
            });
        }
    });
    router.post("/celulas", authMiddleware(userModel), rolMiddleware(...ROLES_ADMIN), async (req, res) => {
        try {
            logger.info("POST /celulas - Creando nueva célula");
            const result = CelulaCreateSchema.safeParse(req.body);
            if (!result.success) {
                res.status(400).json({
                    success: false,
                    message: "Datos de validación inválidos",
                    errors: result.error.errors,
                });
                return;
            }
            const celula = await celulaController.create({ celula: result.data });
            res.status(201).json({
                success: true,
                message: "Célula creada exitosamente",
                data: celula,
            });
        }
        catch (error) {
            logger.error("POST /celulas:", error);
            res.status(400).json({
                success: false,
                message: error instanceof Error
                    ? error.message
                    : "Error al crear célula",
            });
        }
    });
    router.put("/celulas/:id", authMiddleware(userModel), rolMiddleware(...ROLES_ADMIN), async (req, res) => {
        try {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({
                    success: false,
                    message: "ID de célula requerido",
                });
                return;
            }
            logger.info(`PUT /celulas/${id}`);
            const result = CelulaUpdateSchema.safeParse(req.body);
            if (!result.success) {
                res.status(400).json({
                    success: false,
                    message: "Datos de validación inválidos",
                    errors: result.error.errors,
                });
                return;
            }
            const celula = await celulaController.update({
                id: Number(id),
                celula: result.data,
            });
            res.status(200).json({
                success: true,
                message: "Célula actualizada exitosamente",
                data: celula,
            });
        }
        catch (error) {
            logger.error("PUT /celulas/:id:", error);
            res.status(400).json({
                success: false,
                message: error instanceof Error
                    ? error.message
                    : "Error al actualizar célula",
            });
        }
    });
    router.delete("/celulas/:id", authMiddleware(userModel), rolMiddleware("SUPERADMIN"), async (req, res) => {
        try {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({
                    success: false,
                    message: "ID de célula requerido",
                });
                return;
            }
            logger.info(`DELETE /celulas/${id}`);
            await celulaController.delete({ id: Number(id) });
            res.status(200).json({
                success: true,
                message: "Célula eliminada exitosamente",
            });
        }
        catch (error) {
            logger.error("DELETE /celulas/:id:", error);
            res.status(400).json({
                success: false,
                message: error instanceof Error
                    ? error.message
                    : "Error al eliminar célula",
            });
        }
    });
    return router;
}
//# sourceMappingURL=CelulaRouter.js.map