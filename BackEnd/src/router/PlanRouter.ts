// BackEnd/src/router/PlanRouter.ts
type ContextWithParams = Context & { params: Record<string, string> };
// ============================================
import { Router, Context } from "oak";
import { PlanController } from "../Controller/PlanController.ts";
import { PlanService } from "../services/PlanService.ts";
import { PlanModelDB } from "../interface/Plan.ts";
import { UserModelDB } from "../interface/Usuario.ts";
import { PlanCreateSchema, PlanUpdateSchema } from "../schemas/venta/Plan.ts";
import { authMiddleware } from "../middleware/authMiddlewares.ts";
import { rolMiddleware } from "../middleware/rolMiddlewares.ts";
import { ROLES_ADMIN } from "../constants/roles.ts";

export function planRouter(planModel: PlanModelDB, userModel: UserModelDB) {
  const router = new Router();
  const planService = new PlanService(planModel);
  const planController = new PlanController(planService);

  // GET /planes - Obtener todos los planes
  router.get("/planes", authMiddleware(userModel), async (ctx: ContextWithParams) => {
    try {
      const url = ctx.request.url;
      const page = Number(url.searchParams.get("page")) || 1;
      const limit = Number(url.searchParams.get("limit")) || 10;

      const planes = await planController.getAll({ page, limit });

      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        data: planes,
      };
    } catch (error) {
      ctx.response.status = 500;
      ctx.response.body = {
        success: false,
        message: (error as Error).message,
      };
    }
  });

  // GET /planes/:id - Obtener un plan por ID
  router.get("/planes/:id", authMiddleware(userModel), async (ctx: ContextWithParams) => {
    try {
      const { id } = ctx.params;

      const plan = await planController.getById({ id });

      if (!plan) {
        ctx.response.status = 404;
        ctx.response.body = {
          success: false,
          message: "Plan no encontrado",
        };
        return;
      }

      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        data: plan,
      };
    } catch (error) {
      ctx.response.status = 500;
      ctx.response.body = {
        success: false,
        message: (error as Error).message,
      };
    }
  });

  // POST /planes - Crear un nuevo plan
  router.post(
    "/planes",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_ADMIN),
    async (ctx: ContextWithParams) => {
      try {
        const body = await ctx.request.body.json();
        const result = PlanCreateSchema.safeParse(body.plan);

        if (!result.success) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: `Validación fallida: ${result.error.errors.map((error: { message: string }) => error.message).join(", ")}`,
          };
          return;
        }

        const newPlan = await planController.create({ plan: result.data });

        ctx.response.status = 201;
        ctx.response.body = {
          success: true,
          data: newPlan,
        };
      } catch (error) {
        ctx.response.status = 500;
        ctx.response.body = {
          success: false,
          message: (error as Error).message,
        };
      }
    }
  );

  // PUT /planes/:id - Actualizar un plan
  router.put(
    "/planes/:id",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_ADMIN),
    async (ctx: ContextWithParams) => {
      try {
        const { id } = ctx.params;
        const body = await ctx.request.body.json();
        const result = PlanUpdateSchema.safeParse(body.plan);

        if (!result.success) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: `Validación fallida: ${result.error.errors.map((error: { message: string }) => error.message).join(", ")}`,
          };
          return;
        }

        const updatedPlan = await planController.update({ id, plan: result.data });

        if (!updatedPlan) {
          ctx.response.status = 404;
          ctx.response.body = {
            success: false,
            message: "Plan no encontrado",
          };
          return;
        }

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          data: updatedPlan,
        };
      } catch (error) {
        ctx.response.status = 500;
        ctx.response.body = {
          success: false,
          message: (error as Error).message,
        };
      }
    }
  );

  // DELETE /planes/:id - Eliminar un plan
  router.delete(
    "/planes/:id",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_ADMIN),
    async (ctx: ContextWithParams) => {
      try {
        const { id } = ctx.params;

        const deleted = await planController.delete({ id });

        if (!deleted) {
          ctx.response.status = 404;
          ctx.response.body = {
            success: false,
            message: "Plan no encontrado",
          };
          return;
        }

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          message: "Plan eliminado correctamente",
        };
      } catch (error) {
        ctx.response.status = 500;
        ctx.response.body = {
          success: false,
          message: (error as Error).message,
        };
      }
    }
  );

  return router;
}