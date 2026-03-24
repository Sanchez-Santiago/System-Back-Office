import express, { Request, Response } from 'express';
import multer from 'multer';
import { ActualizarController } from "../Controller/ActualizarController";
import { ActualizarService } from "../services/ActualizarService";
import { parseUploadedFile } from "../Utils/Csv";
import { logger } from "../Utils/logger";
import { authMiddleware } from "../middleware/auth.js";
import { rolMiddleware } from "../middleware/rolMiddlewares";
import { ROLES_MANAGEMENT } from "../constants/roles";
import { EstadoCorreoModelDB } from "../interface/estadoCorreo";
import { EstadoVentaModelDB } from "../interface/EstadoVenta";
import { VentaModelDB } from "../interface/venta";
import { UserModelDB } from "../interface/Usuario";
import { CorreoModelDB } from "../interface/correo";

const upload = multer({ storage: multer.memoryStorage() });

export function actualizarRouter(
  estadoCorreoModel: EstadoCorreoModelDB,
  estadoVentaModel: EstadoVentaModelDB,
  ventaModel: VentaModelDB,
  correoModel: CorreoModelDB,
  userModel: UserModelDB,
) {
  const actualizarService = new ActualizarService(
    estadoCorreoModel,
    estadoVentaModel,
    ventaModel,
  );
  const actualizarController = new ActualizarController(
    estadoCorreoModel,
    estadoVentaModel,
    ventaModel,
    correoModel,
    actualizarService,
  );
  const router = express.Router();

  router.post(
    "/actualizar/correo",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_MANAGEMENT),
    upload.single("file"),
    async (req: Request, res: Response) => {
      try {
        const file = req.file;

        if (!file) {
          res.status(400).json({
            success: false,
            message: "No se subió ningún archivo",
          });
          return;
        }

        const parsedData = await parseUploadedFile(file);
        const count = await actualizarController.actualizarEstadoCorreo(
          parsedData as string[][],
        );

        res.status(200).json({
          success: true,
          message: `Se actualizaron ${count} correos`,
        });
      } catch (error) {
        logger.error("Error en /actualizar/correo:", error);
        res.status(500).json({
          success: false,
          message: error instanceof Error ? error.message : "Error interno",
        });
      }
    },
  );

  router.post(
    "/actualizar/estado-venta",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_MANAGEMENT),
    upload.single("file"),
    async (req: Request, res: Response) => {
      try {
        const file = req.file;

        if (!file) {
          res.status(400).json({
            success: false,
            message: "No se subió ningún archivo",
          });
          return;
        }

        const parsedData = await parseUploadedFile(file);

        const count = await actualizarController.actualizarEstadoVenta(
          parsedData as string[][],
        );

        console.log(count);

        res.status(200).json({
          success: true,
          message: `Se actualizaron ${count} estados de venta`,
        });
      } catch (error) {
        logger.error("Error en /actualizar/estado-venta:", error);
        res.status(500).json({
          success: false,
          message: error instanceof Error ? error.message : "Error interno",
        });
      }
    },
  );

  router.post(
    "/actualizar/seguimiento-linea",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_MANAGEMENT),
    upload.single("file"),
    async (req: Request, res: Response) => {
      try {
        const file = req.file;

        if (!file) {
          res.status(400).json({
            success: false,
            message: "No se subió ningún archivo",
          });
          return;
        }

        const parsedData = await parseUploadedFile(file);
        const count = await actualizarController.actualizarSegumientoLinea(
          parsedData as string[][],
        );

        res.status(200).json({
          success: true,
          message: `Se actualizaron ${count} seguimientos de línea`,
        });
      } catch (error) {
        logger.error("Error en /actualizar/seguimiento-linea:", error);
        res.status(500).json({
          success: false,
          message: error instanceof Error ? error.message : "Error interno",
        });
      }
    },
  );

  return router;
}
