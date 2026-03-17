import express from 'express';
import { authMiddleware } from "../middleware/authMiddlewares.ts";
import { rolMiddleware } from "../middleware/rolMiddlewares.ts";
import { ROLES_MANAGEMENT, ROLES_ADMIN } from "../constants/roles.ts";
import { logger } from "../Utils/logger.ts";
import { EstadoCorreoController } from "../Controller/EstadoCorreoController.ts";
import { EstadoCorreoCreateSchema } from "../schemas/correo/EstadoCorreo.ts";
import { ZodError } from "zod";
export function estadoCorreoRouter(estadoCorreoModel, userModel) {
    const router = express.Router();
    const estadoCorreoController = new EstadoCorreoController(estadoCorreoModel);
    router.get("/estados-correo", authMiddleware(userModel), rolMiddleware(...ROLES_MANAGEMENT), async (req, res) => {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            logger.info(`GET /estados-correo - Página: ${page}, Límite: ${limit}`);
            const estados = await estadoCorreoController.getAll({ page, limit });
            res.status(200).json({
                success: true,
                data: estados,
                pagination: {
                    page,
                    limit,
                    total: estados.length,
                },
            });
        }
        catch (error) {
            logger.error("GET /estados-correo:", error);
            res.status(400).json({
                success: false,
                message: error instanceof Error
                    ? error.message
                    : "Error al obtener estados",
            });
        }
    });
    router.get("/estados-correo/stats", authMiddleware(userModel), rolMiddleware(...ROLES_MANAGEMENT), async (req, res) => {
        try {
            logger.info("GET /estados-correo/stats");
            const stats = await estadoCorreoController.getStats();
            res.status(200).json({
                success: true,
                data: stats,
            });
        }
        catch (error) {
            logger.error("GET /estados-correo/stats:", error);
            res.status(400).json({
                success: false,
                message: error instanceof Error
                    ? error.message
                    : "Error al obtener estadísticas",
            });
        }
    });
    router.get("/estados-correo/entregados", authMiddleware(userModel), rolMiddleware(...ROLES_MANAGEMENT), async (req, res) => {
        try {
            logger.info("GET /estados-correo/entregados");
            const estados = await estadoCorreoController.getEntregados();
            res.status(200).json({
                success: true,
                data: estados,
            });
        }
        catch (error) {
            logger.error("GET /estados-correo/entregados:", error);
            res.status(400).json({
                success: false,
                message: error instanceof Error
                    ? error.message
                    : "Error al obtener correos entregados",
            });
        }
    });
    router.get("/estados-correo/no-entregados", authMiddleware(userModel), rolMiddleware(...ROLES_MANAGEMENT), async (req, res) => {
        try {
            logger.info("GET /estados-correo/no-entregados");
            const estados = await estadoCorreoController.getNoEntregados();
            res.status(200).json({
                success: true,
                data: estados,
            });
        }
        catch (error) {
            logger.error("GET /estados-correo/no-entregados:", error);
            res.status(400).json({
                success: false,
                message: error instanceof Error
                    ? error.message
                    : "Error al obtener correos no entregados",
            });
        }
    });
    router.get("/estados-correo/devueltos", authMiddleware(userModel), rolMiddleware(...ROLES_MANAGEMENT), async (req, res) => {
        try {
            logger.info("GET /estados-correo/devueltos");
            const estados = await estadoCorreoController.getDevueltos();
            res.status(200).json({
                success: true,
                data: estados,
            });
        }
        catch (error) {
            logger.error("GET /estados-correo/devueltos:", error);
            res.status(400).json({
                success: false,
                message: error instanceof Error
                    ? error.message
                    : "Error al obtener correos devueltos",
            });
        }
    });
    router.get("/estados-correo/en-transito", authMiddleware(userModel), rolMiddleware(...ROLES_MANAGEMENT), async (req, res) => {
        try {
            logger.info("GET /estados-correo/en-transito");
            const estados = await estadoCorreoController.getEnTransito();
            res.status(200).json({
                success: true,
                data: estados,
            });
        }
        catch (error) {
            logger.error("GET /estados-correo/en-transito:", error);
            res.status(400).json({
                success: false,
                message: error instanceof Error
                    ? error.message
                    : "Error al obtener correos en tránsito",
            });
        }
    });
    router.get("/estados-correo/asignados", authMiddleware(userModel), rolMiddleware(...ROLES_MANAGEMENT), async (req, res) => {
        try {
            logger.info("GET /estados-correo/asignados");
            const estados = await estadoCorreoController.getAsignados();
            res.status(200).json({
                success: true,
                data: estados,
            });
        }
        catch (error) {
            logger.error("GET /estados-correo/asignados:", error);
            res.status(400).json({
                success: false,
                message: error instanceof Error
                    ? error.message
                    : "Error al obtener correos asignados",
            });
        }
    });
    router.get("/estados-correo/por-estado/:estado", authMiddleware(userModel), rolMiddleware(...ROLES_MANAGEMENT), async (req, res) => {
        try {
            const { estado } = req.params;
            if (!estado) {
                res.status(400).json({
                    success: false,
                    message: "Estado requerido en la URL",
                });
                return;
            }
            logger.info(`GET /estados-correo/por-estado/${estado}`);
            const estados = await estadoCorreoController.getByEstado({ estado });
            res.status(200).json({
                success: true,
                data: estados,
            });
        }
        catch (error) {
            logger.error("GET /estados-correo/por-estado/:estado:", error);
            res.status(400).json({
                success: false,
                message: error instanceof Error
                    ? error.message
                    : "Error al obtener correos por estado",
            });
        }
    });
    router.get("/estados-correo/search/sap", authMiddleware(userModel), rolMiddleware(...ROLES_MANAGEMENT, "VENDEDOR"), async (req, res) => {
        try {
            const sap = req.query.sap;
            if (!sap) {
                res.status(400).json({
                    success: false,
                    message: "Código SAP requerido en query params",
                });
                return;
            }
            logger.info(`GET /estados-correo/search/sap - SAP: ${sap}`);
            const estados = await estadoCorreoController.getBySAP({ sap });
            res.status(200).json({
                success: true,
                data: estados,
                total: estados.length,
                message: estados.length === 0
                    ? "No se encontraron estados para este SAP"
                    : `${estados.length} estados encontrados`,
            });
        }
        catch (error) {
            logger.error("GET /estados-correo/search/sap:", error);
            res.status(404).json({
                success: false,
                message: error instanceof Error
                    ? error.message
                    : "Error al buscar historial",
            });
        }
    });
    router.get("/estados-correo/search/sap/ultimo", authMiddleware(userModel), rolMiddleware(...ROLES_MANAGEMENT, "VENDEDOR"), async (req, res) => {
        try {
            const sap = req.query.sap;
            if (!sap) {
                res.status(400).json({
                    success: false,
                    message: "Código SAP requerido en query params",
                });
                return;
            }
            logger.info(`GET /estados-correo/search/sap/ultimo - SAP: ${sap}`);
            const estado = await estadoCorreoController.getLastBySAP({ sap });
            res.status(200).json({
                success: true,
                data: estado,
            });
        }
        catch (error) {
            logger.error("GET /estados-correo/search/sap/ultimo:", error);
            res.status(404).json({
                success: false,
                message: error instanceof Error
                    ? error.message
                    : "Estado no encontrado",
            });
        }
    });
    router.get("/estados-correo/search/ubicacion", authMiddleware(userModel), rolMiddleware(...ROLES_MANAGEMENT), async (req, res) => {
        try {
            const ubicacion = req.query.ubicacion;
            if (!ubicacion) {
                res.status(400).json({
                    success: false,
                    message: "Ubicación requerida en query params",
                });
                return;
            }
            logger.info(`GET /estados-correo/search/ubicacion - Ubicación: ${ubicacion}`);
            const estados = await estadoCorreoController.getByUbicacion({
                ubicacion,
            });
            res.status(200).json({
                success: true,
                data: estados,
            });
        }
        catch (error) {
            logger.error("GET /estados-correo/search/ubicacion:", error);
            res.status(400).json({
                success: false,
                message: error instanceof Error
                    ? error.message
                    : "Error al buscar por ubicación",
            });
        }
    });
    router.get("/estados-correo/search/fecha-rango", authMiddleware(userModel), rolMiddleware(...ROLES_MANAGEMENT), async (req, res) => {
        try {
            const fechaInicio = req.query.fechaInicio;
            const fechaFin = req.query.fechaFin;
            if (!fechaInicio || !fechaFin) {
                res.status(400).json({
                    success: false,
                    message: "Fechas de inicio y fin requeridas en query params",
                });
                return;
            }
            logger.info(`GET /estados-correo/search/fecha-rango - ${fechaInicio} a ${fechaFin}`);
            const estados = await estadoCorreoController.getByFechaRango({
                fechaInicio: new Date(fechaInicio),
                fechaFin: new Date(fechaFin),
            });
            res.status(200).json({
                success: true,
                data: estados,
            });
        }
        catch (error) {
            logger.error("GET /estados-correo/search/fecha-rango:", error);
            res.status(400).json({
                success: false,
                message: error instanceof Error
                    ? error.message
                    : "Error al buscar por rango de fechas",
            });
        }
    });
    router.get("/estados-correo/:id", authMiddleware(userModel), rolMiddleware(...ROLES_MANAGEMENT), async (req, res) => {
        try {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({
                    success: false,
                    message: "ID de estado requerido",
                });
                return;
            }
            const idNumber = Number(id);
            if (isNaN(idNumber) || idNumber <= 0) {
                res.status(400).json({
                    success: false,
                    message: "ID de estado inválido",
                });
                return;
            }
            logger.info(`GET /estados-correo/${id}`);
            const estado = await estadoCorreoController.getById({ id: idNumber });
            res.status(200).json({
                success: true,
                data: estado,
            });
        }
        catch (error) {
            logger.error("GET /estados-correo/:id:", error);
            res.status(404).json({
                success: false,
                message: error instanceof Error
                    ? error.message
                    : "Estado no encontrado",
            });
        }
    });
    router.post("/estados-correo", authMiddleware(userModel), rolMiddleware(...ROLES_ADMIN), async (req, res) => {
        try {
            const body = req.body;
            if (!body || Object.keys(body).length === 0) {
                res.status(400).json({
                    success: false,
                    message: "Datos de estado requeridos",
                });
                return;
            }
            logger.info("POST /estados-correo");
            const usuario_id = req.user.id;
            if (!usuario_id) {
                res.status(401).json({
                    success: false,
                    message: "Usuario no autenticado",
                });
                return;
            }
            const newEstado = {
                sap_id: body.sap_id,
                estado: body.estado || "INICIAL",
                descripcion: body.descripcion || null,
                usuario_id: usuario_id,
                ubicacion_actual: body.ubicacion_actual || null,
            };
            const parsed = EstadoCorreoCreateSchema.parse(newEstado);
            const estado = await estadoCorreoController.create(parsed);
            if (!estado) {
                res.status(500).json({
                    success: false,
                    message: "Error al crear estado",
                });
                return;
            }
            logger.info("Estado creado:", estado);
            res.status(201).json({
                success: true,
                message: "Estado creado exitosamente",
                data: estado,
            });
        }
        catch (error) {
            logger.error("POST /estados-correo:", error);
            if (error instanceof ZodError) {
                res.status(400).json({
                    success: false,
                    message: "Error de validación",
                    errors: error.issues.map((issue) => ({
                        field: issue.path.join("."),
                        message: issue.message,
                    })),
                });
                return;
            }
            if (error instanceof Error) {
                res.status(400).json({
                    success: false,
                    message: error.message,
                });
                return;
            }
            res.status(400).json({
                success: false,
                message: "Error desconocido al crear estado",
            });
        }
    });
    router.put("/estados-correo/:id", authMiddleware(userModel), rolMiddleware(...ROLES_ADMIN), async (req, res) => {
        try {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({
                    success: false,
                    message: "ID de estado requerido",
                });
                return;
            }
            const idNumber = Number(id);
            if (isNaN(idNumber) || idNumber <= 0) {
                res.status(400).json({
                    success: false,
                    message: "ID de estado inválido",
                });
                return;
            }
            const updateData = req.body;
            if (!updateData || Object.keys(updateData).length === 0) {
                res.status(400).json({
                    success: false,
                    message: "No hay datos para actualizar",
                });
                return;
            }
            const updateEstado = {};
            if (updateData.estado !== undefined) {
                updateEstado.estado = updateData.estado.toUpperCase();
            }
            if (updateData.descripcion !== undefined) {
                updateEstado.descripcion = updateData.descripcion;
            }
            if (updateData.ubicacion_actual !== undefined) {
                updateEstado.ubicacion_actual = updateData.ubicacion_actual;
            }
            logger.info(`PUT /estados-correo/${id}`);
            const estadoActualizado = await estadoCorreoController.update({
                id: idNumber,
                input: updateEstado,
            });
            res.status(200).json({
                success: true,
                message: "Estado actualizado exitosamente",
                data: estadoActualizado,
            });
        }
        catch (error) {
            logger.error("PUT /estados-correo/:id:", error);
            res.status(400).json({
                success: false,
                message: error instanceof Error
                    ? error.message
                    : "Error al actualizar estado",
            });
        }
    });
    router.patch("/estados-correo/:id/marcar-entregado", authMiddleware(userModel), rolMiddleware(...ROLES_ADMIN), async (req, res) => {
        try {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({
                    success: false,
                    message: "ID de estado requerido",
                });
                return;
            }
            const idNumber = Number(id);
            if (isNaN(idNumber) || idNumber <= 0) {
                res.status(400).json({
                    success: false,
                    message: "ID de estado inválido",
                });
                return;
            }
            logger.info(`PATCH /estados-correo/${id}/marcar-entregado`);
            const estado = await estadoCorreoController.marcarComoEntregado({ id: idNumber });
            res.status(200).json({
                success: true,
                message: "Correo marcado como entregado exitosamente",
                data: estado,
            });
        }
        catch (error) {
            logger.error("PATCH /estados-correo/:id/marcar-entregado:", error);
            res.status(400).json({
                success: false,
                message: error instanceof Error
                    ? error.message
                    : "Error al marcar como entregado",
            });
        }
    });
    router.patch("/estados-correo/:id/actualizar-ubicacion", authMiddleware(userModel), rolMiddleware(...ROLES_ADMIN), async (req, res) => {
        try {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({
                    success: false,
                    message: "ID de estado requerido",
                });
                return;
            }
            const idNumber = Number(id);
            if (isNaN(idNumber) || idNumber <= 0) {
                res.status(400).json({
                    success: false,
                    message: "ID de estado inválido",
                });
                return;
            }
            const { ubicacion } = req.body;
            if (!ubicacion) {
                res.status(400).json({
                    success: false,
                    message: "Ubicación requerida en el body",
                });
                return;
            }
            logger.info(`PATCH /estados-correo/${id}/actualizar-ubicacion`);
            const estado = await estadoCorreoController.actualizarUbicacion({
                id: idNumber,
                ubicacion,
            });
            res.status(200).json({
                success: true,
                message: "Ubicación actualizada exitosamente",
                data: estado,
            });
        }
        catch (error) {
            logger.error("PATCH /estados-correo/:id/actualizar-ubicacion:", error);
            res.status(400).json({
                success: false,
                message: error instanceof Error
                    ? error.message
                    : "Error al actualizar ubicación",
            });
        }
    });
    router.delete("/estados-correo/:id", authMiddleware(userModel), rolMiddleware("SUPERADMIN"), async (req, res) => {
        try {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({
                    success: false,
                    message: "ID de estado requerido",
                });
                return;
            }
            const idNumber = Number(id);
            if (isNaN(idNumber) || idNumber <= 0) {
                res.status(400).json({
                    success: false,
                    message: "ID de estado inválido",
                });
                return;
            }
            logger.info(`DELETE /estados-correo/${id}`);
            await estadoCorreoController.delete({ id: idNumber });
            res.status(200).json({
                success: true,
                message: "Estado eliminado exitosamente",
            });
        }
        catch (error) {
            logger.error("DELETE /estados-correo/:id:", error);
            res.status(400).json({
                success: false,
                message: error instanceof Error
                    ? error.message
                    : "Error al eliminar estado",
            });
        }
    });
    router.post("/estados-correo/bulk", authMiddleware(userModel), rolMiddleware(...ROLES_MANAGEMENT), async (req, res) => {
        try {
            await estadoCorreoController.bulkCreate(req, res);
            res.status(201).json({
                success: true,
                message: "Estados de correo creados exitosamente",
            });
        }
        catch (error) {
            logger.error("POST /estados-correo/bulk:", error);
            res.status(500).json({
                success: false,
                message: error instanceof Error
                    ? error.message
                    : "Error al crear estados masivamente",
            });
        }
    });
    return router;
}
//# sourceMappingURL=EstadoCorreoRouter.js.map