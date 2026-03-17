import express, { Request, Response } from 'express';
import { authMiddleware } from "../middleware/authMiddlewares.ts";
import { rolMiddleware } from "../middleware/rolMiddlewares.ts";
import { ROLES_ALL, ROLES_MANAGEMENT } from "../constants/roles.ts";
import { logger } from "../Utils/logger.ts";
import { CorreoModelDB } from "../interface/correo.ts";
import { UserModelDB } from "../interface/Usuario.ts";
import { CorreoController } from "../Controller/CorreoController.ts";

export function correoRouter(
  correoModel: CorreoModelDB,
  userModel: UserModelDB,
) {
  const router = express.Router();
  const correoController = new CorreoController(correoModel);

  router.get(
    "/correos",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_MANAGEMENT),
    async (req: Request, res: Response) => {
      try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const name = req.query.name as string | undefined;

        logger.info(`GET /correos - Página: ${page}, Límite: ${limit}`);

        const correos = await correoController.getAll({
          page,
          limit,
          name,
        });

        res.status(200).json({
          success: true,
          data: correos,
          pagination: {
            page,
            limit,
            total: correos.length,
          },
        });
      } catch (error) {
        logger.error("GET /correos:", error);
        res.status(400).json({
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al obtener correos",
        });
      }
    },
  );

  router.get(
    "/correos/stats",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_MANAGEMENT),
    async (req: Request, res: Response) => {
      try {
        logger.info("GET /correos/stats");

        const stats = await correoController.getStats();

        res.status(200).json({
          success: true,
          data: stats,
        });
      } catch (error) {
        logger.error("GET /correos/stats:", error);
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
    "/correos/proximos-vencer",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_MANAGEMENT),
    async (req: Request, res: Response) => {
      try {
        const dias = Number(req.query.dias) || 3;

        logger.info("GET /correos/proximos-vencer");

        const correos = await correoController.getProximosAVencer({ dias });

        res.status(200).json({
          success: true,
          data: correos,
          dias,
        });
      } catch (error) {
        logger.error("GET /correos/proximos-vencer:", error);
        res.status(400).json({
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al obtener correos próximos a vencer",
        });
      }
    },
  );

  router.get(
    "/correos/vencidos",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_MANAGEMENT),
    async (req: Request, res: Response) => {
      try {
        logger.info("GET /correos/vencidos");

        const correos = await correoController.getVencidos();

        res.status(200).json({
          success: true,
          data: correos,
        });
      } catch (error) {
        logger.error("GET /correos/vencidos:", error);
        res.status(400).json({
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al obtener correos vencidos",
        });
      }
    },
  );

  router.get(
    "/correos/search/sap",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_MANAGEMENT),
    async (req: Request, res: Response) => {
      try {
        const sap = req.query.sap as string;

        if (!sap) {
          res.status(400).json({
            success: false,
            message: "Código SAP requerido en query params",
          });
          return;
        }

        logger.info(`GET /correos/search/sap - SAP: ${sap}`);

        const correo = await correoController.getBySAP({ sap });

        res.status(200).json({
          success: true,
          data: correo,
        });
      } catch (error) {
        logger.error("GET /correos/search/sap:", error);
        res.status(404).json({
          success: false,
          message: error instanceof Error
            ? error.message
            : "Correo no encontrado",
        });
      }
    },
  );

  router.get(
    "/correos/search/localidad",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_MANAGEMENT),
    async (req: Request, res: Response) => {
      try {
        const localidad = req.query.localidad as string;

        if (!localidad) {
          res.status(400).json({
            success: false,
            message: "Localidad requerida en query params",
          });
          return;
        }

        logger.info(
          `GET /correos/search/localidad - Localidad: ${localidad}`,
        );

        const correos = await correoController.getByLocalidad({ localidad });

        res.status(200).json({
          success: true,
          data: correos,
        });
      } catch (error) {
        logger.error("GET /correos/search/localidad:", error);
        res.status(400).json({
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al buscar correos por localidad",
        });
      }
    },
  );

  router.get(
    "/correos/search/departamento",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_MANAGEMENT),
    async (req: Request, res: Response) => {
      try {
        const departamento = req.query.departamento as string;

        if (!departamento) {
          res.status(400).json({
            success: false,
            message: "Departamento requerido en query params",
          });
          return;
        }

        logger.info(
          `GET /correos/search/departamento - Departamento: ${departamento}`,
        );

        const correos = await correoController.getByDepartamento({
          departamento,
        });

        res.status(200).json({
          success: true,
          data: correos,
        });
      } catch (error) {
        logger.error("GET /correos/search/departamento:", error);
        res.status(400).json({
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al buscar correos por departamento",
        });
      }
    },
  );

  router.get(
    "/correos/:id",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_MANAGEMENT),
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;

        if (!id) {
          res.status(400).json({
            success: false,
            message: "SAP ID requerido",
          });
          return;
        }

        logger.info(`GET /correos/${id}`);

        const correo = await correoController.getById({ id });

        res.status(200).json({
          success: true,
          data: correo,
        });
      } catch (error) {
        logger.error("GET /correos/:id:", error);
        res.status(404).json({
          success: false,
          message: error instanceof Error
            ? error.message
            : "Correo no encontrado",
        });
      }
    },
  );

  router.post(
    "/correos",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_ALL),
    async (req: Request, res: Response) => {
      try {
        const usuario_id = (req as any).user.id;

        if (!usuario_id) {
          res.status(401).json({
            success: false,
            message: "Usuario no autenticado",
          });
          return;
        }

        const correo = await correoController.create({
          ...req.body,
          usuario_id: (req as any).user.id,
        });

        res.status(201).json({
          success: true,
          message: "Correo creado exitosamente",
          data: correo,
        });
      } catch (error) {
        logger.error("POST /correos:", error);
        res.status(400).json({
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al crear correo",
        });
      }
    },
  );

  router.put(
    "/correos/:id",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_MANAGEMENT),
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;

        if (!id) {
          res.status(400).json({
            success: false,
            message: "SAP ID requerido",
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

        logger.info(`PUT /correos/${id}`);

        const correoActualizado = await correoController.update({
          id,
          input: updateData,
        });

        res.status(200).json({
          success: true,
          message: "Correo actualizado exitosamente",
          data: correoActualizado,
        });
      } catch (error) {
        logger.error("PUT /correos/:id:", error);
        res.status(400).json({
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al actualizar correo",
        });
      }
    },
  );

  router.delete(
    "/correos/:id",
    authMiddleware(userModel),
    rolMiddleware("SUPERADMIN"),
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;

        if (!id) {
          res.status(400).json({
            success: false,
            message: "SAP ID requerido",
          });
          return;
        }

        logger.info(`DELETE /correos/${id}`);

        await correoController.delete({ id });

        res.status(200).json({
          success: true,
          message: "Correo eliminado exitosamente",
        });
      } catch (error) {
        logger.error("DELETE /correos/:id:", error);
        res.status(400).json({
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al eliminar correo",
        });
      }
    },
  );

  return router;
}
