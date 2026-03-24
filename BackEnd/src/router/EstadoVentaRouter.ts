import express, { Request, Response } from 'express';
import { EstadoVentaController } from "../Controller/EstadoVentaController";
import { EstadoVentaService } from "../services/EstadoVentaService";
import { EstadoVentaModelDB } from "../interface/EstadoVenta";
import { UserModelDB } from "../interface/Usuario";
import { authMiddleware } from "../middleware/auth.js";
import { rolMiddleware } from "../middleware/rolMiddlewares";

export function estadoVentaRouter(
  estadoVentaModel: EstadoVentaModelDB,
  userModel: UserModelDB,
) {
  const router = express.Router();

  const estadoVentaService = new EstadoVentaService(estadoVentaModel);
  const estadoVentaController = new EstadoVentaController(estadoVentaService);

  router.get(
    "/estados",
    authMiddleware(userModel),
    async (req: Request, res: Response) => {
      await estadoVentaController.getAll(req, res);
    },
  );

  router.get(
    "/estados/ultimos",
    authMiddleware(userModel),
    async (req: Request, res: Response) => {
      await estadoVentaController.getAllLastEstado(req, res);
    },
  );

  router.get(
    "/estados/buscar",
    authMiddleware(userModel),
    async (req: Request, res: Response) => {
      await estadoVentaController.getByMultipleFilters(req, res);
    },
  );

  router.get(
    "/estados/por-fecha",
    authMiddleware(userModel),
    async (req: Request, res: Response) => {
      await estadoVentaController.getByFechaRango(req, res);
    },
  );

  router.get(
    "/estados/tipo/:estado",
    authMiddleware(userModel),
    async (req: Request, res: Response) => {
      await estadoVentaController.getByEstado(req, res);
    },
  );

  router.get(
    "/estados/venta/:venta_id",
    authMiddleware(userModel),
    async (req: Request, res: Response) => {
      await estadoVentaController.getByVentaId(req, res);
    },
  );

  router.get(
    "/estados/venta/:venta_id/ultimo",
    authMiddleware(userModel),
    async (req: Request, res: Response) => {
      await estadoVentaController.getLastByVentaId(req, res);
    },
  );

  router.get(
    "/estados/:id",
    authMiddleware(userModel),
    async (req: Request, res: Response) => {
      await estadoVentaController.getById(req, res);
    },
  );

  router.post(
    "/estados",
    authMiddleware(userModel),
    rolMiddleware("SUPER_ADMIN", "ADMIN", "BACK_OFFICE"),
    async (req: Request, res: Response) => {
      try {
        const body = req.body;

        if ((req as any).user && ((req as any).user as any).id) {
          body.usuario_id = ((req as any).user as { id: string }).id;
        }

        await estadoVentaController.create(req, res);
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Error al procesar la solicitud",
        });
      }
    },
  );

  router.put(
    "/estados/:id",
    authMiddleware(userModel),
    rolMiddleware("SUPER_ADMIN", "ADMIN", "BACK_OFFICE"),
    async (req: Request, res: Response) => {
      await estadoVentaController.update(req, res);
    },
  );

  router.delete(
    "/estados/:id",
    authMiddleware(userModel),
    rolMiddleware("SUPER_ADMIN", "ADMIN"),
    async (req: Request, res: Response) => {
      await estadoVentaController.delete(req, res);
    },
  );

  router.post(
    "/estados/bulk",
    authMiddleware(userModel),
    rolMiddleware("SUPERADMIN", "ADMIN", "BACK_OFFICE"),
    async (req: Request, res: Response) => {
      await estadoVentaController.bulkCreate(req, res);
    },
  );

  return router;
}
