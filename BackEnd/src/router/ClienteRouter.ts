import express, { Request, Response } from 'express';
import { ClienteController } from "../Controller/ClienteController.ts";
import { ClienteService } from "../services/ClienteService.ts";
import { ClienteModelDB } from "../interface/Cliente.ts";
import { UserModelDB } from "../interface/Usuario.ts";
import { ClienteCreateSchema, ClienteUpdateSchema } from "../schemas/persona/Cliente.ts";
import { authMiddleware } from "../middleware/authMiddlewares.ts";
import { rolMiddleware } from "../middleware/rolMiddlewares.ts";
import { ROLES_CAN_CREATE_CLIENTE, ROLES_ADMIN } from "../constants/roles.ts";
import { mapDatabaseError } from "../Utils/databaseErrorMapper.ts";

export function clienteRouter(clienteModel: ClienteModelDB, userModel: UserModelDB) {
  const router = express.Router();
  const clienteService = new ClienteService(clienteModel);
  const clienteController = new ClienteController(clienteService);

  router.get("/clientes", authMiddleware(userModel), async (req: Request, res: Response) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const clientes = await clienteController.getAllWithPersonaData({ page, limit });

      res.status(200).json({
        success: true,
        data: clientes,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: (error as Error).message,
      });
    }
  });

  router.get(
    "/clientes/persona/:personaId",
    authMiddleware(userModel),
    async (req: Request, res: Response) => {
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
    },
  );

  router.get("/clientes/completo", authMiddleware(userModel), async (req: Request, res: Response) => {
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
    } catch (error) {
      res.status(500).json({
        success: false,
        message: (error as Error).message,
      });
    }
  });

  router.get("/clientes/buscar", authMiddleware(userModel), async (req: Request, res: Response) => {
    try {
      const tipo_documento = req.query.tipo_documento as string;
      const documento = req.query.documento as string;

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
    } catch (error) {
      res.status(500).json({
        success: false,
        message: (error as Error).message,
      });
    }
  });

  router.get("/clientes/:id", authMiddleware(userModel), async (req: Request, res: Response) => {
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
    } catch (error) {
      res.status(500).json({
        success: false,
        message: (error as Error).message,
      });
    }
  });

  router.post(
    "/clientes",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_CAN_CREATE_CLIENTE),
    async (req: Request, res: Response) => {
      try {
        const result = ClienteCreateSchema.safeParse(req.body.cliente);

        if (!result.success) {
          res.status(400).json({
            success: false,
            message: `Validación fallida: ${
              result.error.errors.map((error: { message: string }) =>
                error.message
              ).join(", ")
            }`,
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
      } catch (error) {
        res.status(500).json({
          success: false,
          message: (error as Error).message,
        });
      }
    },
  );

  router.put(
    "/clientes/:id",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_ADMIN),
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const result = ClienteUpdateSchema.safeParse(req.body.cliente);

        if (!result.success) {
          res.status(400).json({
            success: false,
            message: `Validación fallida: ${result.error.errors.map((error: { message: string }) => error.message).join(", ")}`,
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
      } catch (error) {
        res.status(500).json({
          success: false,
          message: (error as Error).message,
        });
      }
    },
  );

  router.delete(
    "/clientes/:id",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_ADMIN),
    async (req: Request, res: Response) => {
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
      } catch (error) {
        res.status(500).json({
          success: false,
          message: (error as Error).message,
        });
      }
    },
  );

  return router;
}
