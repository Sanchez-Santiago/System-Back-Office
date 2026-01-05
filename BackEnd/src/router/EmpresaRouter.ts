// BackEnd/src/router/EmpresaRouter.ts
import { Router, Context } from "oak";
import { EmpresaController } from "../Controller/EmpresaController.ts";
import { EmpresaService } from "../services/EmpresaService.ts";
import { EmpresaMySQL } from "../model/empresaMySQL.ts";
import { EmpresaCreateSchema, EmpresaUpdateSchema } from "../schemas/empresa/Empresa.ts";
import { authMiddleware } from "../middleware/authMiddlewares.ts";
import { rolMiddleware } from "../middleware/rolMiddlewares.ts";
import { ROLES_ADMIN } from "../constants/roles.ts";
import type { AuthenticatedUser } from "../types/userAuth.ts";
import { UserModelDB } from "../interface/Usuario.ts";
import client from "../database/MySQL.ts";

type ContextWithParams = Context & { params: Record<string, string> };

export function empresaRouter(userModel: UserModelDB) {
  const router = new Router();
  const empresaModel = new EmpresaMySQL(client);
  const empresaService = new EmpresaService(empresaModel);
  const empresaController = new EmpresaController(empresaService);

  // GET /empresas - Listar empresas con filtros
  router.get("/empresas", authMiddleware(userModel), async (ctx: ContextWithParams) => {
    try {
      const url = ctx.request.url;
      const page = Number(url.searchParams.get("page")) || 1;
      const limit = Number(url.searchParams.get("limit")) || 10;
      const search = url.searchParams.get("search") || undefined;

      const empresas = await empresaController.getAll({ page, limit, search });

      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        data: empresas,
        meta: { page, limit, search },
      };
    } catch (error) {
      ctx.response.status = 500;
      ctx.response.body = {
        success: false,
        message: (error as Error).message,
      };
    }
  });

  // GET /empresas/:id - Obtener empresa por ID
  router.get("/empresas/:id", authMiddleware(userModel), async (ctx: ContextWithParams) => {
    try {
      const { id } = ctx.params;
      const empresa = await empresaController.getById(id);

      if (!empresa) {
        ctx.response.status = 404;
        ctx.response.body = {
          success: false,
          message: "Empresa no encontrada",
        };
        return;
      }

      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        data: empresa,
      };
    } catch (error) {
      ctx.response.status = 500;
      ctx.response.body = {
        success: false,
        message: (error as Error).message,
      };
    }
  });

  // POST /empresas - Crear empresa
  router.post("/empresas", authMiddleware(userModel), rolMiddleware(...ROLES_ADMIN), async (ctx: ContextWithParams) => {
    try {
      const body = await ctx.request.body.json();
      const result = EmpresaCreateSchema.safeParse(body.empresa);

      if (!result.success) {
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          message: `Validación fallida: ${result.error.errors.map((error) => error.message).join(", ")}`,
        };
        return;
      }

      const empresa = await empresaController.create(result.data);

      ctx.response.status = 201;
      ctx.response.body = {
        success: true,
        data: empresa,
      };
    } catch (error) {
      ctx.response.status = 500;
      ctx.response.body = {
        success: false,
        message: (error as Error).message,
      };
    }
  });

  // PUT /empresas/:id - Actualizar empresa
  router.put("/empresas/:id", authMiddleware(userModel), rolMiddleware(...ROLES_ADMIN), async (ctx: ContextWithParams) => {
    try {
      const { id } = ctx.params;
      const body = await ctx.request.body.json();
      const result = EmpresaUpdateSchema.safeParse(body.empresa);

      if (!result.success) {
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          message: `Validación fallida: ${result.error.errors.map((error) => error.message).join(", ")}`,
        };
        return;
      }

      const empresa = await empresaController.update(id, result.data);

      if (!empresa) {
        ctx.response.status = 404;
        ctx.response.body = {
          success: false,
          message: "Empresa no encontrada",
        };
        return;
      }

      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        data: empresa,
      };
    } catch (error) {
      ctx.response.status = 500;
      ctx.response.body = {
        success: false,
        message: (error as Error).message,
      };
    }
  });

  // DELETE /empresas/:id - Eliminar empresa
  router.delete("/empresas/:id", authMiddleware(userModel), rolMiddleware(...ROLES_ADMIN), async (ctx: ContextWithParams) => {
    try {
      const { id } = ctx.params;
      const success = await empresaController.delete(id);

      if (!success) {
        ctx.response.status = 404;
        ctx.response.body = {
          success: false,
          message: "Empresa no encontrada",
        };
        return;
      }

      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        message: "Empresa eliminada correctamente",
      };
    } catch (error) {
      ctx.response.status = 500;
      ctx.response.body = {
        success: false,
        message: (error as Error).message,
      };
    }
  });

  return router;
}