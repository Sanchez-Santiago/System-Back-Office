// ============================================
// BackEnd/src/router/EstadoVentaRouter.ts
// ============================================
import { Router, Context } from "oak";
import { EstadoVentaController } from "../Controller/EstadoVentaController.ts";
import { EstadoVentaService } from "../services/EstadoVentaService.ts";
import { EstadoVentaMySQL } from "../model/estadoVentaMySQL.ts";
import client from "../database/MySQL.ts";
import { authMiddleware } from "../middleware/authMiddlewares.ts";
import { rolMiddleware } from "../middleware/rolMiddlewares.ts";
import { ROLES_ADMIN, ROLES_MANAGEMENT } from "../constants/roles.ts";
import { UserModelDB } from "../interface/Usuario.ts";

type ContextWithParams = Context & { params: Record<string, string> };

/**
 * Router de Estado Venta
 */
export function estadoVentaRouter(userModel: UserModelDB) {
  const router = new Router();

  // Instancias
  const estadoVentaModel = new EstadoVentaMySQL(client);
  const estadoVentaService = new EstadoVentaService(estadoVentaModel);
  const estadoVentaController = new EstadoVentaController(estadoVentaService);

  // Rutas
  router.get("/estados", authMiddleware(userModel), async (ctx: ContextWithParams) => {
    await estadoVentaController.getAll(ctx);
  });

  router.get("/estados/:id", authMiddleware(userModel), async (ctx: ContextWithParams) => {
    await estadoVentaController.getById(ctx);
  });

  router.get("/estados/venta/:venta_id", authMiddleware(userModel), async (ctx: ContextWithParams) => {
    await estadoVentaController.getByVentaId(ctx);
  });

  router.post("/estados", authMiddleware(userModel), rolMiddleware("SUPER_ADMIN", "ADMIN", "BACK_OFFICE"), async (ctx: ContextWithParams) => {
    await estadoVentaController.create(ctx);
  });

  router.put("/estados/:id", authMiddleware(userModel), rolMiddleware("SUPER_ADMIN", "ADMIN", "BACK_OFFICE"), async (ctx: ContextWithParams) => {
    await estadoVentaController.update(ctx);
  });

  router.delete("/estados/:id", authMiddleware(userModel), rolMiddleware("SUPER_ADMIN", "ADMIN"), async (ctx: ContextWithParams) => {
    await estadoVentaController.delete(ctx);
  });

  return router;
}