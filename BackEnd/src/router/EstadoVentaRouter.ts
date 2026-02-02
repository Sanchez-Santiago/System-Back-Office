// ============================================
// BackEnd/src/router/EstadoVentaRouter.ts
// ============================================
import { Context, Router } from "oak";
import { EstadoVentaController } from "../Controller/EstadoVentaController.ts";
import { EstadoVentaService } from "../services/EstadoVentaService.ts";
import { EstadoVentaModelDB } from "../interface/EstadoVenta.ts";
import { UserModelDB } from "../interface/Usuario.ts";
import { authMiddleware } from "../middleware/authMiddlewares.ts";
import { rolMiddleware } from "../middleware/rolMiddlewares.ts";

type ContextWithParams = Context & { params: Record<string, string> };

/**
 * Router de Estado Venta
 */
export function estadoVentaRouter(
  estadoVentaModel: EstadoVentaModelDB,
  userModel: UserModelDB,
) {
  const router = new Router();

  // Instancias
  const estadoVentaService = new EstadoVentaService(estadoVentaModel);
  const estadoVentaController = new EstadoVentaController(estadoVentaService);

  // Rutas
  router.get(
    "/estados",
    authMiddleware(userModel),
    async (ctx: ContextWithParams) => {
      await estadoVentaController.getAll(ctx);
    },
  );

  router.get(
    "/estados/:id",
    authMiddleware(userModel),
    async (ctx: ContextWithParams) => {
      await estadoVentaController.getById(ctx);
    },
  );

  router.get(
    "/estados/venta/:venta_id",
    authMiddleware(userModel),
    async (ctx: ContextWithParams) => {
      await estadoVentaController.getByVentaId(ctx);
    },
  );

  router.post(
    "/estados",
    authMiddleware(userModel),
    rolMiddleware("SUPER_ADMIN", "ADMIN", "BACK_OFFICE"),
    async (ctx: ContextWithParams) => {
      const body = await ctx.request.body.json();
      
      // Inyectar usuario_id del JWT en el body
      body.usuario_id = (ctx.state.user as { id: string }).id;
      
      // Crear nuevo contexto con el body modificado
      const modifiedCtx = {
        ...ctx,
        request: {
          ...ctx.request,
          body: {
            json: async () => body,
          },
        },
      };
      
      await estadoVentaController.create(modifiedCtx as ContextWithParams);
    },
  );

  router.put(
    "/estados/:id",
    authMiddleware(userModel),
    rolMiddleware("SUPER_ADMIN", "ADMIN", "BACK_OFFICE"),
    async (ctx: ContextWithParams) => {
      await estadoVentaController.update(ctx);
    },
  );

  router.delete(
    "/estados/:id",
    authMiddleware(userModel),
    rolMiddleware("SUPER_ADMIN", "ADMIN"),
    async (ctx: ContextWithParams) => {
      await estadoVentaController.delete(ctx);
    },
  );

  return router;
}
