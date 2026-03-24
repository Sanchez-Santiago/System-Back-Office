import express, { Request, Response } from 'express';
import { ComentarioController } from "../Controller/ComentarioController";
import { ComentarioService } from "../services/ComentarioService";
import { ComentarioModelDB } from "../interface/Comentario";
import { UserModelDB } from "../interface/Usuario";
import { authMiddleware } from "../middleware/auth.js";
import { logger } from "../Utils/logger";

export function comentarioRouter(
  comentarioModel: ComentarioModelDB,
  userModel: UserModelDB,
) {
  const router = express.Router();

  const comentarioService = new ComentarioService(comentarioModel);
  const comentarioController = new ComentarioController(comentarioService);

  router.get(
    "/comentarios",
    authMiddleware(userModel),
    async (req: Request, res: Response) => {
      try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const venta_id = req.query.venta_id
          ? Number(req.query.venta_id)
          : undefined;
        const usuario_id = req.query.usuario_id as string | undefined;
        const tipo_comentario = req.query.tipo_comentario as string | undefined;
        const fecha_desde = req.query.desde
          ? new Date(req.query.desde as string)
          : undefined;
        const fecha_hasta = req.query.hasta
          ? new Date(req.query.hasta as string)
          : undefined;

        const comentarios = await comentarioController.getAll({
          page,
          limit,
          venta_id,
          usuario_id,
          tipo_comentario,
          fecha_desde,
          fecha_hasta,
        });

        res.json({
          success: true,
          data: comentarios,
          pagination: { page, limit, total: comentarios.length },
        });
      } catch (error) {
        logger.error("Error en GET /comentarios:", error);
        res.status(500).json({
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al obtener comentarios",
        });
      }
    },
  );

  router.get(
    "/comentarios/venta/:venta_id",
    authMiddleware(userModel),
    async (req: Request, res: Response) => {
      try {
        const { venta_id } = req.params;
        const ventaIdNumber = Number(venta_id);
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;

        if (isNaN(ventaIdNumber)) {
          res.status(400).json({
            success: false,
            message: "ID de venta inválido",
          });
          return;
        }

        const comentarios = await comentarioController.getByVentaId({
          venta_id: ventaIdNumber,
          page,
          limit,
        });

        res.json({
          success: true,
          data: comentarios,
          pagination: { page, limit, total: comentarios.length },
        });
      } catch (error) {
        logger.error("Error en GET /comentarios/venta/:venta_id:", error);
        res.status(500).json({
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al obtener comentarios de la venta",
        });
      }
    },
  );

  router.get(
    "/comentarios/venta/:venta_id/ultimo",
    authMiddleware(userModel),
    async (req: Request, res: Response) => {
      try {
        const { venta_id } = req.params;
        const ventaIdNumber = Number(venta_id);

        if (isNaN(ventaIdNumber)) {
          res.status(400).json({
            success: false,
            message: "ID de venta inválido",
          });
          return;
        }

        const comentario = await comentarioController.getUltimoByVentaId({
          venta_id: ventaIdNumber,
        });

        if (!comentario) {
          res.status(404).json({
            success: false,
            message: "No hay comentarios para esta venta",
          });
          return;
        }

        res.json({
          success: true,
          data: comentario,
        });
      } catch (error) {
        logger.error("Error en GET /comentarios/venta/:venta_id/ultimo:", error);
        res.status(500).json({
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al obtener el último comentario",
        });
      }
    },
  );

  router.get(
    "/comentarios/usuario/:usuario_id",
    authMiddleware(userModel),
    async (req: Request, res: Response) => {
      try {
        const { usuario_id } = req.params;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;

        const comentarios = await comentarioController.getByUsuarioId({
          usuario_id,
          page,
          limit,
        });

        res.json({
          success: true,
          data: comentarios,
          pagination: { page, limit, total: comentarios.length },
        });
      } catch (error) {
        logger.error("Error en GET /comentarios/usuario/:usuario_id:", error);
        res.status(500).json({
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al obtener comentarios del usuario",
        });
      }
    },
  );

  router.get(
    "/comentarios/:id",
    authMiddleware(userModel),
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const comentario_id = Number(id);

        if (isNaN(comentario_id)) {
          res.status(400).json({
            success: false,
            message: "ID inválido",
          });
          return;
        }

        const comentario = await comentarioController.getById({ comentario_id });

        if (!comentario) {
          res.status(404).json({
            success: false,
            message: "Comentario no encontrado",
          });
          return;
        }

        res.json({
          success: true,
          data: comentario,
        });
      } catch (error) {
        logger.error("Error en GET /comentarios/:id:", error);
        res.status(500).json({
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al obtener comentario",
        });
      }
    },
  );

  router.post(
    "/comentarios",
    authMiddleware(userModel),
    async (req: Request, res: Response) => {
      try {
        const usuario_id = ((req as any).user as { id: string }).id;
        const usuario_rol = ((req as any).user as { rol: string }).rol;

        const input = {
          ...req.body,
          usuarios_id: usuario_id,
        };

        const comentario = await comentarioController.create({
          input,
          usuario_id,
          usuario_rol,
        });

        res.status(201).json({
          success: true,
          message: "Comentario creado exitosamente",
          data: comentario,
        });
      } catch (error) {
        logger.error("Error en POST /comentarios:", error);
        res.status(400).json({
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al crear comentario",
        });
      }
    },
  );

  router.patch(
    "/comentarios/:id",
    authMiddleware(userModel),
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const comentario_id = Number(id);
        const usuario_id = ((req as any).user as { id: string }).id;
        const usuario_rol = ((req as any).user as { rol: string }).rol;

        if (isNaN(comentario_id)) {
          res.status(400).json({
            success: false,
            message: "ID inválido",
          });
          return;
        }

        const comentario = await comentarioController.update({
          comentario_id,
          input: req.body,
          usuario_id,
          usuario_rol,
        });

        if (!comentario) {
          res.status(404).json({
            success: false,
            message: "Comentario no encontrado",
          });
          return;
        }

        res.json({
          success: true,
          message: "Comentario actualizado exitosamente",
          data: comentario,
        });
      } catch (error) {
        logger.error("Error en PATCH /comentarios/:id:", error);
        res.status(400).json({
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al actualizar comentario",
        });
      }
    },
  );

  router.delete(
    "/comentarios/:id",
    authMiddleware(userModel),
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const comentario_id = Number(id);
        const usuario_id = ((req as any).user as { id: string }).id;
        const usuario_rol = ((req as any).user as { rol: string }).rol;

        if (isNaN(comentario_id)) {
          res.status(400).json({
            success: false,
            message: "ID inválido",
          });
          return;
        }

        const result = await comentarioController.delete({
          comentario_id,
          usuario_id,
          usuario_rol,
        });

        if (!result) {
          res.status(404).json({
            success: false,
            message: "Comentario no encontrado",
          });
          return;
        }

        res.json({
          success: true,
          message: "Comentario eliminado exitosamente",
        });
      } catch (error) {
        logger.error("Error en DELETE /comentarios/:id:", error);
        res.status(400).json({
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al eliminar comentario",
        });
      }
    },
  );

  return router;
}
