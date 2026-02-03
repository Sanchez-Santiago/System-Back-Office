// ============================================
// BackEnd/src/Controller/EstadoVentaController.ts
// ============================================
import { EstadoVentaService } from "../services/EstadoVentaService.ts";
import { EstadoVentaCreateSchema, EstadoVentaUpdateSchema } from "../schemas/venta/EstadoVenta.ts";
import { Context } from "oak";
import { manejoDeError } from "../Utils/errores.ts";

type ContextWithParams = Context & { params: Record<string, string> };

export class EstadoVentaController {
  private estadoVentaService: EstadoVentaService;

  constructor(estadoVentaService: EstadoVentaService) {
    this.estadoVentaService = estadoVentaService;
  }

  async getAll(ctx: ContextWithParams) {
    try {
      const page = Number(ctx.params.page) || 1;
      const limit = Number(ctx.params.limit) || 10;

      const estados = await this.estadoVentaService.getAll({ page, limit });

      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        data: estados,
      };
    } catch (error) {
      ctx.response.status = 500;
      ctx.response.body = {
        success: false,
        message: "Error interno del servidor",
      };
      manejoDeError("Error en getAll EstadoVenta", error);
    }
  }

  async getById(ctx: ContextWithParams) {
    try {
      const { id } = ctx.params;

      const estado = await this.estadoVentaService.getById({ id });

      if (!estado) {
        ctx.response.status = 404;
        ctx.response.body = {
          success: false,
          message: "Estado no encontrado",
        };
        return;
      }

      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        data: estado,
      };
    } catch (error) {
      ctx.response.status = 500;
      ctx.response.body = {
        success: false,
        message: "Error interno del servidor",
      };
      manejoDeError("Error en getById EstadoVenta", error);
    }
  }

  async getByVentaId(ctx: ContextWithParams) {
    try {
      const venta_id = Number(ctx.params.venta_id);

      const estados = await this.estadoVentaService.getByVentaId({ venta_id });

      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        data: estados,
      };
    } catch (error) {
      ctx.response.status = 500;
      ctx.response.body = {
        success: false,
        message: "Error interno del servidor",
      };
      manejoDeError("Error en getByVentaId EstadoVenta", error);
    }
  }

  async create(ctx: ContextWithParams) {
    try {
      const body = await ctx.request.body.json();
      const result = EstadoVentaCreateSchema.safeParse(body);

      if (!result.success) {
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          message: "Datos inválidos",
          errors: result.error.flatten(),
        };
        return;
      }

      const estado = await this.estadoVentaService.create(result.data);

      ctx.response.status = 201;
      ctx.response.body = {
        success: true,
        data: estado,
      };
    } catch (error) {
      ctx.response.status = 500;
      ctx.response.body = {
        success: false,
        message: "Error interno del servidor",
      };
      manejoDeError("Error en create EstadoVenta", error);
    }
  }

  async update(ctx: ContextWithParams) {
    try {
      const { id } = ctx.params;
      const body = await ctx.request.body.json();
      const result = EstadoVentaUpdateSchema.safeParse(body.estadoVenta || body);

      if (!result.success) {
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          message: "Datos inválidos",
          errors: result.error.flatten(),
        };
        return;
      }

      const updated = await this.estadoVentaService.update({ id, input: result.data });

      if (!updated) {
        ctx.response.status = 404;
        ctx.response.body = {
          success: false,
          message: "Estado no encontrado",
        };
        return;
      }

      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        message: "Estado actualizado",
      };
    } catch (error) {
      ctx.response.status = 500;
      ctx.response.body = {
        success: false,
        message: "Error interno del servidor",
      };
      manejoDeError("Error en update EstadoVenta", error);
    }
  }

  async delete(ctx: ContextWithParams) {
    try {
      const { id } = ctx.params;

      const deleted = await this.estadoVentaService.delete({ id });

      if (!deleted) {
        ctx.response.status = 404;
        ctx.response.body = {
          success: false,
          message: "Estado no encontrado",
        };
        return;
      }

      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        message: "Estado eliminado",
      };
    } catch (error) {
      ctx.response.status = 500;
      ctx.response.body = {
        success: false,
        message: "Error interno del servidor",
      };
      manejoDeError("Error en delete EstadoVenta", error);
    }
  }
}