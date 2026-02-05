// BackEnd/src/router/ActulizarRouter.ts
import { Router, Context } from "oak";
import { ActualizarController } from "../Controller/ActualizarController.ts";
import { ActualizarService } from "../services/ActualizarService.ts";
import { parseUploadedFile } from "../Utils/Csv.ts";
import { logger } from "../Utils/logger.ts";
import { authMiddleware } from "../middleware/authMiddlewares.ts";
import { rolMiddleware } from "../middleware/rolMiddlewares.ts";
import { ROLES_MANAGEMENT } from "../constants/roles.ts";
import { EstadoCorreoModelDB } from "../interface/estadoCorreo.ts";
import { EstadoVentaModelDB } from "../interface/EstadoVenta.ts";
import { VentaModelDB } from "../interface/Venta.ts";
import { UserModelDB } from "../interface/Usuario.ts";

export function actualizarRouter(
  estadoCorreoModel: EstadoCorreoModelDB,
  estadoVentaModel: EstadoVentaModelDB,
  ventaModel: VentaModelDB,
  userModel: UserModelDB,
) {
  const actualizarService = new ActualizarService(estadoCorreoModel, estadoVentaModel, ventaModel);
  const actualizarController = new ActualizarController(estadoCorreoModel, estadoVentaModel, ventaModel, actualizarService);
  const router = new Router();

  // POST /actualizar/correo
  router.post(
    "/actualizar/correo",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_MANAGEMENT),
    async (ctx: Context) => {
      try {
        const body = await ctx.request.body.formData();
        const file = body.get("file") as File;

        if (!file) {
          ctx.response.status = 400;
          ctx.response.body = { success: false, message: "No se subió ningún archivo" };
          return;
        }

        const parsedData = await parseUploadedFile(file);
        const count = await actualizarController.actualizarEstadoCorreo(parsedData as string[][]);

        ctx.response.status = 200;
        ctx.response.body = { success: true, message: `Se actualizaron ${count} correos` };
      } catch (error) {
        logger.error("Error en /actualizar/correo:", error);
        ctx.response.status = 500;
        ctx.response.body = { success: false, message: error instanceof Error ? error.message : "Error interno" };
      }
    }
  );

  // POST /actualizar/estado-venta
  router.post(
    "/actualizar/estado-venta",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_MANAGEMENT),
    async (ctx: Context) => {
      try {
        const body = await ctx.request.body.formData();
        const file = body.get("file") as File;

        if (!file) {
          ctx.response.status = 400;
          ctx.response.body = { success: false, message: "No se subió ningún archivo" };
          return;
        }

        const parsedData = await parseUploadedFile(file);
        const count = await actualizarController.actualizarEstadoVenta(parsedData as string[][]);

        ctx.response.status = 200;
        ctx.response.body = { success: true, message: `Se actualizaron ${count} estados de venta` };
      } catch (error) {
        logger.error("Error en /actualizar/estado-venta:", error);
        ctx.response.status = 500;
        ctx.response.body = { success: false, message: error instanceof Error ? error.message : "Error interno" };
      }
    }
  );

  // POST /actualizar/seguimiento-linea (Comentado hasta implementación completa)
  /*
  router.post("/actualizar/seguimiento-linea", 
    authMiddleware(userModel),
    rolMiddleware(...ROLES_MANAGEMENT),
    async (ctx: Context) => {
    try {
      const body = await ctx.request.body.formData();
      const file = body.get("file") as File;

      if (!file) {
        ctx.response.status = 400;
        ctx.response.body = { success: false, message: "No se subió ningún archivo" };
        return;
      }

      const parsedData = await parseUploadedFile(file);
      const count = await actualizarController.actualizarSegumientoLinea(parsedData as string[][]);

      ctx.response.status = 200;
      ctx.response.body = { success: true, message: `Se actualizaron ${count} seguimientos de línea` };
    } catch (error) {
      logger.error("Error en /actualizar/seguimiento-linea:", error);
      ctx.response.status = 500;
      ctx.response.body = { success: false, message: error instanceof Error ? error.message : "Error interno" };
    }
  });
  */

  return router;
}
