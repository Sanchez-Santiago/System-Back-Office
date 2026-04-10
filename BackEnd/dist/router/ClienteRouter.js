import express from 'express';
import { ClienteController } from "../Controller/ClienteController";
import { ClienteService } from "../services/ClienteService";
import { ClienteCreateSchema, ClienteUpdateSchema } from "../schemas/persona/Cliente";
import { authMiddleware } from "../middleware/auth.js";
import { rolMiddleware } from "../middleware/rolMiddlewares";
import { ROLES_CAN_CREATE_CLIENTE, ROLES_ADMIN } from "../constants/roles";
import { mapDatabaseError } from "../Utils/databaseErrorMapper";
export function clienteRouter(clienteModel, userModel) {
    const router = express.Router();
    const clienteService = new ClienteService(clienteModel);
    const clienteController = new ClienteController(clienteService);
    router.get("/clientes", authMiddleware(userModel), async (req, res) => {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const clientes = await clienteController.getAllWithPersonaData({ page, limit });
            res.status(200).json({
                success: true,
                data: clientes,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    });
    router.get("/clientes/persona/:personaId", authMiddleware(userModel), async (req, res) => {
        try {
            const { personaId } = req.params;
            const cliente = await clienteController.getWithPersonaData({
                personaId,
            });
            if (!cliente) {
                res.status(404).json({
                    success: false,
                    message: "Cliente no encontrado",
                });
                return;
            }
            res.status(200).json({
                success: true,
                data: cliente,
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
    router.get("/clientes/completo", authMiddleware(userModel), async (req, res) => {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const clientes = await clienteController.getAllWithPersonaData({
                page,
                limit,
            });
            res.status(200).json({
                success: true,
                data: clientes,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    });
    router.get("/clientes/buscar", authMiddleware(userModel), async (req, res) => {
        try {
            const tipo_documento = req.query.tipo_documento;
            const documento = req.query.documento;
            if (!tipo_documento || !documento) {
                res.status(400).json({
                    success: false,
                    message: "tipo_documento y documento son requeridos",
                });
                return;
            }
            const cliente = await clienteController.getByDocumento({
                tipo_documento,
                documento,
            });
            if (!cliente) {
                res.status(404).json({
                    success: false,
                    message: "Cliente no encontrado",
                });
                return;
            }
            res.status(200).json({
                success: true,
                data: cliente,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    });
    router.get("/clientes/:id", authMiddleware(userModel), async (req, res) => {
        try {
            const { id } = req.params;
            const cliente = await clienteController.getById({ id });
            if (!cliente) {
                res.status(404).json({
                    success: false,
                    message: "Cliente no encontrado",
                });
                return;
            }
            res.status(200).json({
                success: true,
                data: cliente,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    });
    router.post("/clientes", authMiddleware(userModel), rolMiddleware(...ROLES_CAN_CREATE_CLIENTE), async (req, res) => {
        try {
            const result = ClienteCreateSchema.safeParse(req.body.cliente);
            if (!result.success) {
                res.status(400).json({
                    success: false,
                    message: `Validación fallida: ${result.error.errors.map((error) => error.message).join(", ")}`,
                });
                return;
            }
            const newCliente = await clienteController.create({
                cliente: result.data,
            });
            res.status(201).json({
                success: true,
                data: newCliente,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    });
    router.put("/clientes/:id", authMiddleware(userModel), rolMiddleware(...ROLES_ADMIN), async (req, res) => {
        try {
            const { id } = req.params;
            const result = ClienteUpdateSchema.safeParse(req.body.cliente);
            if (!result.success) {
                res.status(400).json({
                    success: false,
                    message: `Validación fallida: ${result.error.errors.map((error) => error.message).join(", ")}`,
                });
                return;
            }
            const updatedCliente = await clienteController.update({
                id,
                cliente: result.data,
            });
            if (!updatedCliente) {
                res.status(404).json({
                    success: false,
                    message: "Cliente no encontrado",
                });
                return;
            }
            res.status(200).json({
                success: true,
                data: updatedCliente,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    });
    router.delete("/clientes/:id", authMiddleware(userModel), rolMiddleware(...ROLES_ADMIN), async (req, res) => {
        try {
            const { id } = req.params;
            const deleted = await clienteController.delete({ id });
            if (!deleted) {
                res.status(404).json({
                    success: false,
                    message: "Cliente no encontrado",
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: "Cliente eliminado correctamente",
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
//# sourceMappingURL=ClienteRouter.js.map