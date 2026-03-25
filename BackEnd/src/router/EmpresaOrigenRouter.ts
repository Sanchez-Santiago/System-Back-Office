import express, { Request, Response } from 'express';
import { EmpresaOrigenController } from "../Controller/EmpresaOrigenController";
import { EmpresaOrigenService } from "../services/EmpresaOrigenService";
import { EmpresaOrigenModelDB } from "../interface/EmpresaOrigen";
import { UserModelDB } from "../interface/Usuario";
import { EmpresaOrigenCreateSchema } from "../schemas/venta/EmpresaOrigen";
import { authMiddleware } from "../middleware/auth.js";
import { rolMiddleware } from "../middleware/rolMiddlewares";
import { logger } from "../Utils/logger";
import { PostgresClient } from "../database/PostgreSQL";

export function empresaOrigenRouter(
  empresaOrigenModel: EmpresaOrigenModelDB,
  userModel: UserModelDB,
  pgClient?: PostgresClient,
) {
  const router = express.Router();

  const empresaOrigenService = new EmpresaOrigenService(empresaOrigenModel);
  const empresaOrigenController = new EmpresaOrigenController(
    empresaOrigenService,
  );

  router.get(
    "/empresa-origen",
    authMiddleware(userModel),
    async (req: Request, res: Response) => {
      try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const search = req.query.search as string | undefined;
        const paisParam = req.query.pais as string | undefined;

        const user = (req as any).user;
        const rol = user?.rol?.toUpperCase();
        const permisos = user?.permisos || [];
        const esAdmin = rol === 'ADMIN' || rol === 'SUPERADMIN' || permisos.includes('SUPERADMIN');

        let paisFiltro: string | undefined;

        if (esAdmin) {
          if (paisParam) {
            paisFiltro = paisParam;
          }
        } else if (user?.celula) {
          const client = pgClient?.getClient();
          if (client) {
            try {
              const result = await client.queryObject(
                `SELECT c.pais_venta FROM celula c WHERE c.id_celula = $1`,
                [user.celula]
              );
              const paisCelula = result.rows[0]?.pais_venta;
              if (paisCelula) {
                paisFiltro = paisCelula;
              } else if (paisParam) {
                paisFiltro = paisParam;
              }
            } catch (e) {
              logger.warn("Error obteniendo país de célula:", e);
            }
          }
        } else if (paisParam) {
          paisFiltro = paisParam;
        }

        logger.info(
          `GET /empresa-origen - Página: ${page}, Límite: ${limit}, País: ${paisFiltro}`,
        );

        const empresas = await empresaOrigenController.getAll({
          page,
          limit,
          search,
          pais: paisFiltro,
        });
        res.status(200).json({
          success: true,
          data: empresas,
          filtro: {
            pais: paisFiltro,
            rol: rol,
          },
        });
      } catch (error) {
        logger.error("GET /empresa-origen:", error);
        res.status(500).json({ error: "Error interno del servidor" });
      }
    },
  );

  router.get(
    "/empresa-origen/:id",
    authMiddleware(userModel),
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        if (!id) {
          res.status(400).json({ error: "ID requerido" });
          return;
        }

        logger.info(`GET /empresa-origen/${id}`);

        const empresa = await empresaOrigenController.getById(id);
        if (!empresa) {
          res.status(404).json({ success: false, error: "Empresa origen no encontrada" });
          return;
        }

        res.status(200).json({
          success: true,
          data: empresa
        });
      } catch (error) {
        logger.error("GET /empresa-origen/:id:", error);
        res.status(500).json({ error: "Error interno del servidor" });
      }
    },
  );

  router.post(
    "/empresa-origen",
    authMiddleware(userModel),
    rolMiddleware("SUPERADMIN", "ADMIN"),
    async (req: Request, res: Response) => {
      try {
        logger.info("POST /empresa-origen - Body:", req.body);

        const result = EmpresaOrigenCreateSchema.safeParse(req.body);
        if (!result.success) {
          res.status(400).json({ 
            success: false, 
            message: "Validación fallida",
            errors: result.error.errors 
          });
          return;
        }

        const empresa = await empresaOrigenController.create(result.data as any);
        const user = (req as any).user;

        if (pgClient) {
          try {
            const { NotificacionService } = await import("../services/NotificacionService");
            const notifService = new NotificacionService(pgClient);
            await notifService.notificarEmpresaOrigen({
              accion: "CREAR",
              empresaOrigenId: empresa.empresa_origen_id,
              empresaOrigenNombre: empresa.nombre_empresa,
              pais: empresa.pais,
              usuarioCreadorId: user.id || user.persona_id,
            });
          } catch (e) {
            logger.warn("Error enviando notificación de empresa:", e);
          }
        }

        res.status(201).json({
          success: true,
          data: empresa
        });
      } catch (error) {
        logger.error("POST /empresa-origen:", error);
        if (error instanceof Error && error.message.includes("validation")) {
          res.status(400).json({ success: false, error: error.message });
        } else {
          res.status(500).json({ success: false, error: "Error interno del servidor", details: (error as Error).message });
        }
      }
    },
  );

  router.put(
    "/empresa-origen/:id",
    authMiddleware(userModel),
    rolMiddleware("SUPERADMIN", "ADMIN"),
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        if (!id) {
          res.status(400).json({ error: "ID requerido" });
          return;
        }

        logger.info(`PUT /empresa-origen/${id} - Body:`, req.body);

        const empresa = await empresaOrigenController.update(id, req.body);
        if (!empresa) {
          res.status(404).json({ success: false, error: "Empresa origen no encontrada" });
          return;
        }

        const user = (req as any).user;
        if (pgClient) {
          try {
            const { NotificacionService } = await import("../services/NotificacionService");
            const notifService = new NotificacionService(pgClient);
            await notifService.notificarEmpresaOrigen({
              accion: "ACTUALIZAR",
              empresaOrigenId: empresa.empresa_origen_id,
              empresaOrigenNombre: empresa.nombre_empresa,
              pais: empresa.pais,
              usuarioCreadorId: user.id || user.persona_id,
            });
          } catch (e) {
            logger.warn("Error enviando notificación de empresa:", e);
          }
        }

        res.status(200).json({
          success: true,
          data: empresa
        });
      } catch (error) {
        logger.error("PUT /empresa-origen/:id:", error);
        if (error instanceof Error && error.message.includes("validation")) {
          res.status(400).json({ error: error.message });
        } else {
          res.status(500).json({ error: "Error interno del servidor" });
        }
      }
    },
  );

  router.delete(
    "/empresa-origen/:id",
    authMiddleware(userModel),
    rolMiddleware("SUPERADMIN", "ADMIN"),
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        if (!id) {
          res.status(400).json({ error: "ID requerido" });
          return;
        }

        logger.info(`DELETE /empresa-origen/${id}`);

        const success = await empresaOrigenController.delete(id);
        if (!success) {
          res.status(404).json({ error: "Empresa origen no encontrada" });
          return;
        }

        res.status(204).send();
      } catch (error) {
        logger.error("DELETE /empresa-origen/:id:", error);
        res.status(500).json({ error: "Error interno del servidor" });
      }
    },
  );

  return router;
}
