import express, { Request, Response } from 'express';
import { authMiddleware } from "../middleware/auth.js";
import { rolMiddleware } from "../middleware/rolMiddlewares";
import { ROLES_MANAGEMENT } from "../constants/roles";
import { EstadisticaController } from "../Controller/EstadisticaController";
import { EstadisticaService } from "../services/EstadisticaService";
import { EstadisticaPostgreSQL } from "../model/EstadisticaPostgreSQL";
import { UserModelDB } from "../interface/Usuario";
import { logger } from "../Utils/logger";
import { PostgresClient } from "../database/PostgreSQL";

export function estadisticaRouter(
  estadisticaModel: EstadisticaPostgreSQL, 
  usuarioModel: UserModelDB,
  pgClient?: PostgresClient
) {
  const router = express.Router();

  const estadisticaService = new EstadisticaService(estadisticaModel);
  const estadisticaController = new EstadisticaController(estadisticaService);

  router.get(
    "/estadisticas",
    authMiddleware(usuarioModel),
    rolMiddleware(...ROLES_MANAGEMENT),
    async (req: Request, res: Response) => {
      try {
        const periodo = req.query.periodo as string || "MES";
        const cellaId = req.query.cellaId as string | undefined;
        const asesorId = req.query.asesorId as string | undefined;
        const fechaPortacionDesde = req.query.fechaPortacionDesde as string | undefined;
        const fechaPortacionHasta = req.query.fechaPortacionHasta as string | undefined;
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

        logger.info(`GET /estadisticas - periodo: ${periodo}, cellaId: ${cellaId}, asesorId: ${asesorId}, pais: ${paisFiltro}`);

        const filters = {
          periodo: periodo as any,
          cellaId,
          asesorId,
          userId: user?.persona_id,
          userRol: user?.rol,
          fechaPortacionDesde,
          fechaPortacionHasta,
          pais: paisFiltro,
        };

        const estadisticas = await estadisticaController.getEstadisticas(filters);

        res.status(200).json({
          success: true,
          data: estadisticas,
          filtro: {
            pais: paisFiltro,
            rol: rol,
          }
        });
      } catch (error) {
        logger.error("GET /estadisticas:", error);
        res.status(400).json({
          success: false,
          message: error instanceof Error ? error.message : "Error al obtener estadísticas",
        });
      }
    }
  );

  router.get(
    "/estadisticas/recargas",
    authMiddleware(usuarioModel),
    rolMiddleware(...ROLES_MANAGEMENT),
    async (req: Request, res: Response) => {
      try {
        const periodo = req.query.periodo as string || "MES";
        const cellaId = req.query.cellaId as string | undefined;
        const fechaPortacionDesde = req.query.fechaPortacionDesde as string | undefined;
        const fechaPortacionHasta = req.query.fechaPortacionHasta as string | undefined;
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

        logger.info(`GET /estadisticas/recargas - periodo: ${periodo}, cellaId: ${cellaId}, pais: ${paisFiltro}`);

        const filters = {
          periodo: periodo as any,
          cellaId,
          userId: user?.persona_id,
          userRol: user?.rol,
          fechaPortacionDesde,
          fechaPortacionHasta,
          pais: paisFiltro,
        };

        const recargas = await estadisticaController.getRecargas(filters);

        res.status(200).json({
          success: true,
          data: recargas,
          filtro: {
            pais: paisFiltro,
            rol: rol,
          }
        });
      } catch (error) {
        logger.error("GET /estadisticas/recargas:", error);
        res.status(400).json({
          success: false,
          message: error instanceof Error ? error.message : "Error al obtener recargas",
        });
      }
    }
  );

  return router;
}
