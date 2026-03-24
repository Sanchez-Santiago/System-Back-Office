import express, { Request, Response } from 'express';
import { logger } from "../Utils/logger";
import { PostgresClient } from "../database/PostgreSQL";

import { VentaController } from "../Controller/VentaController";
import { VentaModelDB } from "../interface/venta";
import { UserModelDB } from "../interface/Usuario";
import { ClienteModelDB } from "../interface/Cliente";
import { CorreoModelDB } from "../interface/correo";
import { PortabilidadModelDB } from "../interface/Portabilidad";
import { LineaNuevaModelDB } from "../interface/LineaNueva";
import { PlanModelDB } from "../interface/Plan";
import { PromocionModelDB } from "../interface/Promocion";
import { EstadoVentaModelDB } from "../interface/EstadoVenta";
import {
  VentaCreate,
  VentaCreateSchema,
  VentaUpdateSchema,
} from "../schemas/venta/Venta";
import { PortabilidadCreate } from "../schemas/venta/Portabilidad";
import { CorreoCreateSchema } from "../schemas/correo/Correo";
import { CorreoController } from "../Controller/CorreoController";
import { LineaNuevaController } from "../Controller/LineaNuevaController";
import { PortabilidadController } from "../Controller/PortabilidadController";
import { EstadoVentaController } from "../Controller/EstadoVentaController";
import { EstadoVentaService } from "../services/EstadoVentaService";
import { PlanService } from "../services/PlanService";
import { PromocionService } from "../services/PromocionService";
import { authMiddleware } from "../middleware/auth.js";
import { rolMiddleware } from "../middleware/rolMiddlewares";
import { ROLES_ADMIN, ROLES_MANAGEMENT } from "../constants/roles";
import { mapDatabaseError } from "../Utils/databaseErrorMapper";
import { VentaRequest } from "../types/ventaTypes";

function convertBigIntToString(obj: any): any {
  if (typeof obj === "bigint") {
    return obj.toString();
  }
  if (obj !== null && typeof obj === "object") {
    if (typeof obj.toISOString === "function") {
      return obj.toISOString();
    }
    if (obj.epoch && typeof obj.epoch === "number") {
      return new Date(obj.epoch * 1000).toISOString();
    }
    if (Array.isArray(obj)) {
      return obj.map(convertBigIntToString);
    }
    const converted: any = {};
    for (const key in obj) {
      converted[key] = convertBigIntToString(obj[key]);
    }
    return converted;
  }
  if (Array.isArray(obj)) {
    return obj.map(convertBigIntToString);
  }
  return obj;
}

export function ventaRouter(
  ventaModel: VentaModelDB,
  userModel: UserModelDB,
  correoModel: CorreoModelDB,
  lineaNuevaModel: LineaNuevaModelDB,
  portabilidadModel: PortabilidadModelDB,
  clienteModel: ClienteModelDB,
  planModel: PlanModelDB,
  promocionModel: PromocionModelDB,
  estadoVentaModel: EstadoVentaModelDB,
  pgClient?: PostgresClient,
) {
  const router = express.Router();
  const ventaController = new VentaController(
    ventaModel,
    clienteModel,
    correoModel,
    lineaNuevaModel,
    portabilidadModel,
    planModel,
    promocionModel,
    estadoVentaModel,
  );
  const planService = new PlanService(planModel);
  const promocionService = new PromocionService(promocionModel);
  const correoController = new CorreoController(correoModel);
  const lineaNuevaController = new LineaNuevaController(
    lineaNuevaModel,
    ventaModel,
    portabilidadModel,
  );
  const portabilidadController = new PortabilidadController(
    portabilidadModel,
    ventaModel,
    lineaNuevaModel,
  );

  router.get(
    "/ventas",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_MANAGEMENT),
    async (req: Request, res: Response) => {
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
        } else if (!esAdmin && user?.celula) {
          const client = pgClient?.getClient();
          if (client) {
            try {
              const result = await client.queryObject(
                `SELECT c.pais_venta FROM celula c WHERE c.id_celula = $1`,
                [user.celula]
              );
              paisFiltro = result.rows[0]?.pais_venta || undefined;
            } catch (e) {
              logger.warn("Error obteniendo país de célula:", e);
            }
          }
        }

        logger.debug(`GET /ventas - Página: ${page}, Límite: ${limit}, País: ${paisFiltro}`);

        const ventas = (await ventaController.getAll({ page, limit, pais: paisFiltro })) || [];

        res.status(200).json({
          success: true,
          data: convertBigIntToString(ventas),
          pagination: {
            page,
            limit,
            total: ventas.length,
          },
          filtro: {
            pais: paisFiltro,
            rol: rol,
          },
        });
      } catch (error) {
        logger.error("GET /ventas:", error);
        const isDev = process.env.MODO === "development";
        const mapped = mapDatabaseError(error, isDev);
        if (mapped) {
          res.status(mapped.statusCode).json({ success: false, message: mapped.message });
        } else {
          res.status(500).json({
            success: false,
            message: isDev
              ? (error as Error).message
              : "Error interno del servidor",
            ...(isDev && { stack: (error as Error).stack }),
          });
        }
      }
    },
  );

  router.get(
    "/ventas/estadisticas",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_MANAGEMENT),
    async (req: Request, res: Response) => {
      try {
        const paisParam = req.query.pais as string | undefined;

        const user = (req as any).user;
        const rol = user?.rol?.toUpperCase();
        const esAdmin = rol === 'ADMIN' || rol === 'SUPERADMIN';

        let paisFiltro: string | undefined;

        if (esAdmin && paisParam) {
          paisFiltro = paisParam;
        } else if (!esAdmin && user?.celula) {
          const client = pgClient?.getClient();
          if (client) {
            try {
              const result = await client.queryObject(
                `SELECT c.pais_venta FROM celula c WHERE c.id_celula = $1`,
                [user.celula]
              );
              paisFiltro = result.rows[0]?.pais_venta || undefined;
            } catch (e) {
              logger.warn("Error obteniendo país de célula:", e);
            }
          }
        }

        logger.debug(`GET /ventas/estadisticas - País: ${paisFiltro}`);

        const vendedorId = (rol === 'VENDEDOR') ? user.id : undefined;
        const stats = await ventaController.getStatistics(paisFiltro, vendedorId);

        res.status(200).json({
          success: true,
          data: stats,
          filtro: {
            pais: paisFiltro,
            rol: rol,
          },
        });
      } catch (error) {
        logger.error("GET /ventas/estadisticas:", error);
        const isDev = process.env.MODO === "development";
        const mapped = mapDatabaseError(error, isDev);
        if (mapped) {
          res.status(mapped.statusCode).json({ success: false, message: mapped.message });
        } else {
          res.status(500).json({
            success: false,
            message: isDev
              ? (error as Error).message
              : "Error interno del servidor",
            ...(isDev && { stack: (error as Error).stack }),
          });
        }
      }
    },
  );

  router.get(
    "/ventas/fechas",
    authMiddleware(userModel),
    async (req: Request, res: Response) => {
      try {
        const start = req.query.start as string;
        const end = req.query.end as string;

        if (!start || !end) {
          res.status(400).json({
            success: false,
            message: "Parámetros 'start' y 'end' son requeridos",
          });
          return;
        }

        const startDate = new Date(start);
        const endDate = new Date(end);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          res.status(400).json({
            success: false,
            message: "Fechas inválidas",
          });
          return;
        }

        logger.debug(`GET /ventas/fechas - ${start} a ${end}`);

        const ventas = await ventaController.getByDateRange({
          start: startDate,
          end: endDate,
        });

        res.status(200).json({
          success: true,
          data: ventas,
        });
      } catch (error) {
        logger.error("GET /ventas/fechas:", error);
        res.status(500).json({
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al buscar ventas por fecha",
        });
      }
    },
  );

  router.get(
    "/ventas/sds/:sds",
    authMiddleware(userModel),
    async (req: Request, res: Response) => {
      try {
        const { sds } = req.params;

        logger.debug(`GET /ventas/sds/${sds}`);

        const venta = await ventaController.getBySDS({ sds });

        if (!venta) {
          res.status(404).json({
            success: false,
            message: "Venta no encontrada",
          });
          return;
        }

        res.status(200).json({
          success: true,
          data: venta,
        });
      } catch (error) {
        logger.error("GET /ventas/sds:", error);
        res.status(500).json({
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al buscar venta por SDS",
        });
      }
    },
  );

  router.get(
    "/ventas/sap/:sap",
    authMiddleware(userModel),
    async (req: Request, res: Response) => {
      try {
        const { sap } = req.params;

        logger.debug(`GET /ventas/sap/${sap}`);

        const venta = await ventaController.getBySAP({ sap });

        if (!venta) {
          res.status(404).json({
            success: false,
            message: "Venta no encontrada",
          });
          return;
        }

        res.status(200).json({
          success: true,
          data: venta,
        });
      } catch (error) {
        logger.error("GET /ventas/sap:", error);
        res.status(500).json({
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al buscar venta por SAP",
        });
      }
    },
  );

  router.get(
    "/ventas/vendedor/:vendedor",
    authMiddleware(userModel),
    async (req: Request, res: Response) => {
      try {
        const { vendedor } = req.params;

        logger.debug(`GET /ventas/vendedor/${vendedor}`);

        const ventas = await ventaController.getByVendedor({ vendedor });

        res.status(200).json({
          success: true,
          data: ventas,
        });
      } catch (error) {
        logger.error("GET /ventas/vendedor:", error);
        res.status(500).json({
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al buscar ventas por vendedor",
        });
      }
    },
  );

  router.get(
    "/ventas/cliente/:cliente",
    authMiddleware(userModel),
    async (req: Request, res: Response) => {
      try {
        const { cliente } = req.params;

        logger.debug(`GET /ventas/cliente/${cliente}`);

        const ventas = await ventaController.getByCliente({ cliente });

        res.status(200).json({
          success: true,
          data: ventas,
        });
      } catch (error) {
        logger.error("GET /ventas/cliente:", error);
        res.status(500).json({
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al buscar ventas por cliente",
        });
      }
    },
  );

  router.get(
    "/ventas/plan/:plan",
    authMiddleware(userModel),
    async (req: Request, res: Response) => {
      try {
        const plan = Number(req.params.plan);

        if (isNaN(plan)) {
          res.status(400).json({
            success: false,
            message: "ID de plan inválido",
          });
          return;
        }

        logger.debug(`GET /ventas/plan/${plan}`);

        const ventas = await ventaController.getByPlan({ plan });

        res.status(200).json({
          success: true,
          data: ventas,
        });
      } catch (error) {
        logger.error("GET /ventas/plan:", error);
        res.status(500).json({
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al buscar ventas por plan",
        });
      }
    },
  );

  router.get(
    "/ventas/:id/detalle",
    authMiddleware(userModel),
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const ventaId = Number(id);

        if (isNaN(ventaId)) {
          res.status(400).json({
            success: false,
            message: "ID de venta inválido",
          });
          return;
        }

        logger.debug(`GET /ventas/${id}/detalle`);

        await ventaController.getVentaDetalleCompleto(req, res);
      } catch (error) {
        logger.error("GET /ventas/:id/detalle:", error);
        const isDev = process.env.MODO === "development";
        res.status(500).json({
          success: false,
          message: isDev
            ? (error as Error).message
            : "Error interno del servidor",
          ...(isDev && { stack: (error as Error).stack }),
        });
      }
    },
  );

  router.get(
    "/ventas/ui",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_MANAGEMENT),
    async (req: Request, res: Response) => {
      try {
        await ventaController.getVentasUI(req, res);
      } catch (error) {
        logger.error("GET /ventas/ui:", error);
        const isDev = process.env.MODO === "development";
        res.status(500).json({
          success: false,
          message: isDev
            ? (error as Error).message
            : "Error interno del servidor",
          ...(isDev && { stack: (error as Error).stack }),
        });
      }
    },
  );

  router.get("/ventas/:id", authMiddleware(userModel), async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      logger.debug(`GET /ventas/${id}`);

      const venta = await ventaController.getById({ id });

      if (!venta) {
        res.status(404).json({
          success: false,
          message: "Venta no encontrada",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: venta,
      });
    } catch (error) {
      logger.error("GET /ventas/:id:", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error
          ? error.message
          : "Error al obtener venta",
      });
    }
  });

  router.post("/ventas", authMiddleware(userModel), async (req: Request, res: Response) => {
    try {
      const body: VentaRequest = req.body;
      const user = (req as any).user;

      const result = await ventaController.createFullVenta(
        body,
        user.id,
      );
      res.status(result.success ? 201 : result.errors ? 400 : 500).json(result);
    } catch (error) {
      logger.error("POST /ventas:", error);

      const isDev = process.env.MODO === "development";
      const mapped = mapDatabaseError(error, isDev);
      if (mapped) {
        res.status(mapped.statusCode).json({ success: false, message: mapped.message });
      } else {
        res.status(500);
        const responseBody: Record<string, unknown> = {
          success: false,
          message: isDev
            ? (error as Error).message
            : "Error interno del servidor",
        };
        if (isDev) {
          responseBody.stack = (error as Error).stack;
        }
        res.json(responseBody);
      }
    }
  });

  router.put(
    "/ventas/:id",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_ADMIN),
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;

        logger.debug(`PUT /ventas/${id}`);

        const result = VentaUpdateSchema.safeParse(req.body);

        if (!result.success) {
          logger.error(
            "PUT /ventas/:id validation error:",
            result.error.errors,
          );

          res.status(400).json({
            success: false,
            message: "Validación fallida",
            errors: result.error.errors.map((e) => ({
              field: e.path.join("."),
              message: e.message,
            })),
            ...(process.env.MODO === "development" && {
              stack: result.error.stack,
              details: result.error,
            }),
          });
          return;
        }

        const updatedVenta = await ventaController.update({
          id,
          venta: result.data,
        });

        logger.info("PUT /ventas/:id - Success");
        res.status(200).json({
          success: true,
          data: updatedVenta,
        });
      } catch (error) {
        logger.error("PUT /ventas/:id:", error);

        const isDev = process.env.MODO === "development";
        res.status(500).json({
          success: false,
          message: "Error interno del servidor",
          ...(isDev && {
            stack: (error as Error).stack,
            details: error,
          }),
        });
      }
    },
  );

  router.delete(
    "/ventas/:id",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_ADMIN),
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;

        logger.debug(`DELETE /ventas/${id}`);

        const deleted = await ventaController.delete({ id });

        if (!deleted) {
          res.status(404).json({
            success: false,
            message: "Venta no encontrada",
          });
          return;
        }

        logger.info("DELETE /ventas/:id - Success");
        res.status(204).send();
      } catch (error) {
        logger.error("DELETE /ventas/:id:", error);

        const isDev = process.env.MODO === "development";
        res.status(500).json({
          success: false,
          message: "Error interno del servidor",
          ...(isDev && {
            stack: (error as Error).stack,
            details: error,
          }),
        });
      }
    },
  );

  return router;
}
