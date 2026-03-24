import express, { Request, Response } from 'express';
import { PromocionController } from "../Controller/PromocionController";
import { PromocionService } from "../services/PromocionService";
import { PromocionModelDB } from "../interface/Promocion";
import { UserModelDB } from "../interface/Usuario";
import { PromocionCreateSchema, PromocionUpdateSchema } from "../schemas/venta/Promocion";
import { authMiddleware } from "../middleware/auth.js";
import { rolMiddleware } from "../middleware/rolMiddlewares";
import { ROLES_ADMIN } from "../constants/roles";
import { logger } from "../Utils/logger";
import { PostgresClient } from "../database/PostgreSQL";
import { mapDatabaseError } from "../Utils/databaseErrorMapper";

export function promocionRouter(promocionModel: PromocionModelDB, userModel: UserModelDB, pgClient?: PostgresClient) {
  const router = express.Router();
  const promocionService = new PromocionService(promocionModel);
  const promocionController = new PromocionController(promocionService);

  router.get("/promociones", authMiddleware(userModel), async (req: Request, res: Response) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const paisParam = req.query.pais as string | undefined;
      
      const user = (req as any).user;
      const rol = user?.rol?.toUpperCase();
      const esAdmin = rol === 'ADMIN' || rol === 'SUPERADMIN';
      
      let paisFiltro: string | undefined;
      
      if (esAdmin && paisParam) {
        paisFiltro = paisParam;
      } else if (!esAdmin) {
        // No admin: obtener país de su usuario (precargado en authMiddleware)
        paisFiltro = user?.pais_venta || undefined;
      }

      const promociones = await promocionController.getAll({ page, limit, pais: paisFiltro });

      res.status(200).json({
        success: true,
        data: promociones,
        filtro: {
          pais: paisFiltro,
          rol: rol,
        },
      });
    } catch (error) {
      const isDev = process.env.MODO === "development";
      const mapped = mapDatabaseError(error, isDev);
      if (mapped) {
        res.status(mapped.statusCode).json({ success: false, message: mapped.message });
      } else {
        res.status(500).json({
          success: false,
          message: isDev ? (error as Error).message : "Error interno del servidor",
          ...(isDev && { stack: (error as Error).stack })
        });
      }
    }
  });

  router.get("/promociones/empresa/:empresa", authMiddleware(userModel), async (req: Request, res: Response) => {
    try {
      const { empresa } = req.params;

      const promociones = await promocionController.getByEmpresa({ empresa });

      res.status(200).json({
        success: true,
        data: promociones,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: (error as Error).message,
      });
    }
  });

  router.get("/promociones/:id", authMiddleware(userModel), async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const promocion = await promocionController.getById({ id });

      if (!promocion) {
        res.status(404).json({
          success: false,
          message: "Promoción no encontrada",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: promocion,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: (error as Error).message,
      });
    }
  });

  router.post(
    "/promociones",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_ADMIN),
    async (req: Request, res: Response) => {
      try {
        logger.debug('POST /promociones');

        const body = req.body;
        
        if (body.fecha_terminacion && typeof body.fecha_terminacion === 'string' && body.fecha_terminacion.includes('/')) {
          const parts = body.fecha_terminacion.split('/');
          if (parts.length === 3) {
            body.fecha_terminacion = `${parts[2]}-${parts[1]}-${parts[0]}`;
          }
        }
        
        const result = PromocionCreateSchema.safeParse(body);

        if (!result.success) {
          logger.error('POST /promociones validation error:', result.error.errors);

          res.status(400).json({
            success: false,
            message: "Validación fallida",
            errors: result.error.errors.map(e => ({
              field: e.path.join('.'),
              message: e.message
            })),
            ...(process.env.MODO === "development" && {
              stack: result.error.stack,
              details: result.error
            })
          });
          return;
        }

        const newPromocion = await promocionController.create({ promocion: result.data });

        res.status(201).json({
          success: true,
          data: newPromocion,
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: (error as Error).message,
        });
      }
    }
  );

  router.put(
    "/promociones/:id",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_ADMIN),
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const body = req.body;
        
        if (body.promocion?.fecha_terminacion && typeof body.promocion.fecha_terminacion === 'string' && body.promocion.fecha_terminacion.includes('/')) {
          const parts = body.promocion.fecha_terminacion.split('/');
          if (parts.length === 3) {
            body.promocion.fecha_terminacion = `${parts[2]}-${parts[1]}-${parts[0]}`;
          }
        }
        
        const result = PromocionUpdateSchema.safeParse(body.promocion);

        if (!result.success) {
          res.status(400).json({
            success: false,
            message: `Validación fallida: ${result.error.errors.map((error: { message: string }) => error.message).join(", ")}`,
          });
          return;
        }

        const updatedPromocion = await promocionController.update({ id, promocion: result.data });

        if (!updatedPromocion) {
          res.status(404).json({
            success: false,
            message: "Promoción no encontrada",
          });
          return;
        }

        res.status(200).json({
          success: true,
          data: updatedPromocion,
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: (error as Error).message,
        });
      }
    }
  );

  router.delete(
    "/promociones/:id",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_ADMIN),
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;

        const deleted = await promocionController.delete({ id });

        if (!deleted) {
          res.status(404).json({
            success: false,
            message: "Promoción no encontrada",
          });
          return;
        }

        res.status(200).json({
          success: true,
          message: "Promoción eliminada correctamente",
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: (error as Error).message,
        });
      }
    }
  );

  // PATCH /promociones/:id/activar
  router.patch(
    "/promociones/:id/activar",
    authMiddleware(userModel),
    rolMiddleware("ADMIN", "SUPERADMIN"),
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const user = (req as any).user;

        const promocion = await promocionController.getById({ id });
        if (!promocion) {
          res.status(404).json({ success: false, message: "Promoción no encontrada" });
          return;
        }

        const updatedPromocion = await promocionController.update({ id, promocion: { activo: true } });

        // Notificar
        if (pgClient) {
          try {
            const { NotificacionService } = await import("../services/NotificacionService");
            const notifService = new NotificacionService(pgClient);
            await notifService.notificarPromocion({
              accion: "ACTIVAR",
              promocionId: Number(id),
              promocionNombre: promocion.nombre,
              empresaOrigenId: promocion.empresa_origen_id,
              usuarioCreadorId: user.id,
            });
          } catch (e) {
            console.warn("Error enviando notificación:", e);
          }
        }

        res.status(200).json({ success: true, message: "Promoción activada", data: updatedPromocion });
      } catch (error) {
        res.status(500).json({ success: false, message: (error as Error).message });
      }
    }
  );

  // PATCH /promociones/:id/desactivar
  router.patch(
    "/promociones/:id/desactivar",
    authMiddleware(userModel),
    rolMiddleware("ADMIN", "SUPERADMIN"),
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const user = (req as any).user;

        const promocion = await promocionController.getById({ id });
        if (!promocion) {
          res.status(404).json({ success: false, message: "Promoción no encontrada" });
          return;
        }

        const updatedPromocion = await promocionController.update({ id, promocion: { activo: false } });

        // Notificar
        if (pgClient) {
          try {
            const { NotificacionService } = await import("../services/NotificacionService");
            const notifService = new NotificacionService(pgClient);
            await notifService.notificarPromocion({
              accion: "DESACTIVAR",
              promocionId: Number(id),
              promocionNombre: promocion.nombre,
              empresaOrigenId: promocion.empresa_origen_id,
              usuarioCreadorId: user.id,
            });
          } catch (e) {
            console.warn("Error enviando notificación:", e);
          }
        }

        res.status(200).json({ success: true, message: "Promoción desactivada", data: updatedPromocion });
      } catch (error) {
        res.status(500).json({ success: false, message: (error as Error).message });
      }
    }
  );

  return router;
}
