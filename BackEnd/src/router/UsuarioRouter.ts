import express, { Request, Response } from 'express';
import { authMiddleware } from "../middleware/auth.js";
import { rolMiddleware } from "../middleware/rolMiddlewares";

import { ROLES_ADMIN, ROLES_MANAGEMENT } from "../constants/roles";

import { UserModelDB } from "../interface/Usuario";
import { UsuarioController } from "../Controller/UsuarioController";
import { logger } from "../Utils/logger";
import { UsuarioUpdateSchema } from "../schemas/persona/User";

export function usuarioRouter(userModel: UserModelDB) {
  const router = express.Router();
  const usuarioController = new UsuarioController(userModel);

  router.get(
    "/usuarios",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_MANAGEMENT),
    async (req: Request, res: Response) => {
      try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const name = req.query.name as string | undefined;
        const email = req.query.email as string | undefined;

        logger.info(`GET /usuarios - Página: ${page}, Límite: ${limit}`);

        const usuarios = await usuarioController.getAll({
          page,
          limit,
          name,
          email,
        });

        res.status(200).json({
          success: true,
          data: usuarios,
          pagination: {
            page,
            limit,
            total: usuarios.length,
          },
        });
      } catch (error) {
        res.status(400).json({
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al obtener usuarios",
        });
      }
    },
  );

  router.get(
    "/usuarios/stats",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_ADMIN),
    async (req: Request, res: Response) => {
      try {
        logger.info("GET /usuarios/stats");

        const stats = await usuarioController.getStats();

        res.status(200).json({
          success: true,
          data: stats,
        });
      } catch (error) {
        logger.error("GET /usuarios/stats:", error);
        res.status(400).json({
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al obtener estadísticas",
        });
      }
    },
  );

  router.get(
    "/usuarios/search/email",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_MANAGEMENT),
    async (req: Request, res: Response) => {
      try {
        const email = req.query.email as string;

        if (!email) {
          res.status(400).json({
            success: false,
            message: "Email requerido en query params",
          });
          return;
        }

        logger.info(`GET /usuarios/search/email - Email: ${email}`);

        const usuario = await usuarioController.getByEmail({ email });

        res.status(200).json({
          success: true,
          data: usuario,
        });
      } catch (error) {
        logger.error("GET /usuarios/search/email:", error);
        res.status(404).json({
          success: false,
          message: error instanceof Error
            ? error.message
            : "Usuario no encontrado",
        });
      }
    },
  );

  router.get(
    "/usuarios/search/legajo",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_MANAGEMENT),
    async (req: Request, res: Response) => {
      try {
        const legajo = req.query.legajo as string;

        if (!legajo) {
          res.status(400).json({
            success: false,
            message: "Legajo requerido en query params",
          });
          return;
        }

        logger.info(`GET /usuarios/search/legajo - Legajo: ${legajo}`);

        const usuario = await usuarioController.getByLegajo({ legajo });

        res.status(200).json({
          success: true,
          data: usuario,
        });
      } catch (error) {
        logger.error("GET /usuarios/search/legajo:", error);
        res.status(404).json({
          success: false,
          message: error instanceof Error
            ? error.message
            : "Usuario no encontrado",
        });
      }
    },
  );

  router.get(
    "/usuarios/search/exa",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_MANAGEMENT),
    async (req: Request, res: Response) => {
      try {
        const exa = req.query.exa as string;

        if (!exa) {
          res.status(400).json({
            success: false,
            message: "Código EXA requerido en query params",
          });
          return;
        }

        logger.info(`GET /usuarios/search/exa - EXA: ${exa}`);

        const usuario = await usuarioController.getByExa({ exa });

        res.status(200).json({
          success: true,
          data: usuario,
        });
      } catch (error) {
        logger.error("GET /usuarios/search/exa:", error);
        res.status(404).json({
          success: false,
          message: error instanceof Error
            ? error.message
            : "Usuario no encontrado",
        });
      }
    },
  );

  router.get(
    "/usuarios/:id",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_MANAGEMENT),
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;

        if (!id) {
          res.status(400).json({
            success: false,
            message: "ID de usuario requerido",
          });
          return;
        }

        logger.info(`GET /usuarios/${id}`);

        const usuario = await usuarioController.getById({ id });

        res.status(200).json({
          success: true,
          data: usuario,
        });
      } catch (error) {
        logger.error("GET /usuarios/:id:", error);
        res.status(404).json({
          success: false,
          message: error instanceof Error
            ? error.message
            : "Usuario no encontrado",
        });
      }
    },
  );

  router.put(
    "/usuarios/:id",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_ADMIN),
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;

        if (!id) {
          res.status(400).json({
            success: false,
            message: "ID de usuario requerido",
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

        logger.info(`PUT /usuarios/${id}`);

        const result = UsuarioUpdateSchema.partial().safeParse(updateData);

        if (!result.success) {
          res.status(400).json({
            success: false,
            message: "Datos de validación inválidos",
            errors: result.error.errors,
          });
          return;
        }

        const usuarioActualizado = await usuarioController.update({
          id,
          input: result.data,
        });

        res.status(200).json({
          success: true,
          message: "Usuario actualizado exitosamente",
          data: usuarioActualizado,
        });
      } catch (error) {
        logger.error("PUT /usuarios/:id:", error);
        res.status(400).json({
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al actualizar usuario",
        });
      }
    },
  );

  router.patch(
    "/usuarios/:id/status",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_ADMIN),
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;

        if (!id) {
          res.status(400).json({
            success: false,
            message: "ID de usuario requerido",
          });
          return;
        }

        const { estado } = req.body;

        if (!estado) {
          res.status(400).json({
            success: false,
            message: "Estado requerido en el body",
          });
          return;
        }

        logger.info(`PATCH /usuarios/${id}/status - Estado: ${estado}`);

        const usuarioActualizado = await usuarioController.changeStatus({
          id,
          estado,
        });

        res.status(200).json({
          success: true,
          message: `Estado cambiado a ${estado} exitosamente`,
          data: usuarioActualizado,
        });
      } catch (error) {
        logger.error("PATCH /usuarios/:id/status:", error);
        res.status(400).json({
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al cambiar estado",
        });
      }
    },
  );

  router.delete(
    "/usuarios/:id",
    authMiddleware(userModel),
    rolMiddleware("SUPERADMIN"),
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;

        if (!id) {
          res.status(400).json({
            success: false,
            message: "ID de usuario requerido",
          });
          return;
        }

        logger.info(`DELETE /usuarios/${id}`);

        await usuarioController.delete({ id });

        res.status(200).json({
          success: true,
          message:
            "Usuario eliminado exitosamente (incluyendo historial de contraseñas)",
        });
      } catch (error) {
        logger.error("DELETE /usuarios/:id:", error);
        res.status(400).json({
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al eliminar usuario",
        });
      }
    },
  );

  return router;
}
