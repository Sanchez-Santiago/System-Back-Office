// ============================================
// BackEnd/src/Controller/EstadoVentaController.ts
// VERSIÓN CORREGIDA Y MEJORADA
// ============================================
import 'dotenv/config';
import { EstadoVentaService } from "../services/EstadoVentaService";
import {
  EstadoVenta,
  EstadoVentaCreateSchema,
  EstadoVentaUpdateSchema,
} from "../schemas/venta/EstadoVenta";
import { manejoDeError } from "../Utils/errores";

export class EstadoVentaController {
  private estadoVentaService: EstadoVentaService;

  constructor(estadoVentaService: EstadoVentaService) {
    this.estadoVentaService = estadoVentaService;
  }

  /**
   * Obtener todos los estados con paginación
   */
  async getAll(req: any, res: any) {
    try {
      const url = new URL(req.url);
      const page = Number(url.searchParams.get("page")) || 1;
      const limit = Number(url.searchParams.get("limit")) || 10;

      const estados = await this.estadoVentaService.getAll({ page, limit });

      res.status(200).json({
        success: true,
        data: estados,
        pagination: {
          page,
          limit,
          count: estados.length,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
      manejoDeError("Error en getAll EstadoVenta", error);
    }
  }

  /**
   * Obtener estado por ID
   */
  async getById(req: any, res: any) {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: "ID es requerido",
        });
        return;
      }

      const estado = await this.estadoVentaService.getById({ id });

      if (!estado) {
        res.status(404).json({
          success: false,
          message: "Estado no encontrado",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: estado,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
      manejoDeError("Error en getById EstadoVenta", error);
    }
  }

  /**
   * Obtener todos los estados de una venta específica
   */
  async getByVentaId(req: any, res: any) {
    try {
      const venta_id = Number(req.params.venta_id);

      if (!venta_id || venta_id < 1) {
        res.status(400).json({
          success: false,
          message: "venta_id inválido",
        });
        return;
      }

      const estados = await this.estadoVentaService.getByVentaId({ venta_id });

      res.status(200).json({
        success: true,
        data: estados,
        count: estados.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
      manejoDeError("Error en getByVentaId EstadoVenta", error);
    }
  }

  /**
   * Obtener el último estado de una venta específica
   */
  async getLastByVentaId(req: any, res: any) {
    try {
      const venta_id = Number(req.params.venta_id);

      if (!venta_id || venta_id < 1) {
        res.status(400).json({
          success: false,
          message: "venta_id inválido",
        });
        return;
      }

      const estado = await this.estadoVentaService.getLastByVentaId({
        venta_id,
      });

      if (!estado) {
        res.status(404).json({
          success: false,
          message: "No se encontró estado para esta venta",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: estado,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
      manejoDeError("Error en getLastByVentaId EstadoVenta", error);
    }
  }

  /**
   * Obtener el último estado de todas las ventas
   */
  async getAllLastEstado(req: any, res: any) {
    try {
      const estados = await this.estadoVentaService.getAllLastEstado();

      res.status(200).json({
        success: true,
        data: estados,
        count: estados.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener últimos estados",
      });
      manejoDeError("Error en getAllLastEstado EstadoVenta", error);
    }
  }

  /**
   * Crear un nuevo estado
   */
  async create(req: any, res: any) {
    try {
      const body = await req.body;
      const result = EstadoVentaCreateSchema.safeParse(body);

      if (!result.success) {
        res.status(400).json({
          success: false,
          message: "Datos inválidos",
          errors: result.error.flatten(),
        });
        return;
      }

      const estado = await this.estadoVentaService.create(result.data);

res.status(201).json({
        success: true,
        data: estado,
        message: "Estado creado exitosamente",
      });
    } catch (error) {
      // Errores de validación específicos
      if (error instanceof Error) {
        if (error.message.includes("no existe")) {
          res.status(404).json({
            success: false,
            message: error.message,
          });
          return;
        }
        if (error.message.includes("inválido")) {
          res.status(400).json({
            success: false,
            message: error.message,
          });
          return;
        }
      }

      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
      manejoDeError("Error en create EstadoVenta", error);
    }
  }

  /**
   * Actualizar un estado existente
   */
  async update(req: any, res: any) {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: "ID es requerido",
        });
        return;
      }

      const body = req.body;
      const result = EstadoVentaUpdateSchema.safeParse(
        body.estadoVenta || body,
      );

      if (!result.success) {
        res.status(400).json({
          success: false,
          message: "Datos inválidos",
          errors: result.error.flatten(),
        });
        return;
      }

      const updated = await this.estadoVentaService.update({
        id,
        input: result.data,
      });

      if (!updated) {
        res.status(404).json({
          success: false,
          message: "Estado no encontrado",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Estado actualizado exitosamente",
      });
    } catch (error) {
      // Errores de validación específicos
      if (error instanceof Error && error.message.includes("no existe")) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
      manejoDeError("Error en update EstadoVenta", error);
    }
  }

  /**
   * Eliminar un estado
   */
  async delete(req: any, res: any) {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: "ID es requerido",
        });
        return;
      }

      const deleted = await this.estadoVentaService.delete({ id });

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: "Estado no encontrado",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Estado eliminado exitosamente",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
      manejoDeError("Error en delete EstadoVenta", error);
    }
  }

  /**
   * Obtener estados por tipo/estado específico
   */
  async getByEstado(req: any, res: any) {
    try {
      const { estado } = req.params;

      if (!estado) {
        res.status(400).json({
          success: false,
          message: "Estado es requerido",
        });
        return;
      }

      const estados = await this.estadoVentaService.getByEstado({ estado });

      res.status(200).json({
        success: true,
        data: estados,
        count: estados.length,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("inválido")) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
      manejoDeError("Error en getByEstado EstadoVenta", error);
    }
  }

  /**
   * Obtener estados por rango de fechas
   */
  async getByFechaRango(req: any, res: any) {
    try {
      const url = new URL(req.url);
      const fechaInicio = url.searchParams.get("fechaInicio");
      const fechaFin = url.searchParams.get("fechaFin");

      if (!fechaInicio || !fechaFin) {
        res.status(400).json({
          success: false,
          message: "fechaInicio y fechaFin son requeridos",
        });
        return;
      }

      const estados = await this.estadoVentaService.getByFechaRango({
        fechaInicio: new Date(fechaInicio),
        fechaFin: new Date(fechaFin),
      });

      res.status(200).json({
        success: true,
        data: estados,
        count: estados.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
      manejoDeError("Error en getByFechaRango EstadoVenta", error);
    }
  }

  /**
   * Filtrado avanzado con múltiples parámetros
   */
  async getByMultipleFilters(req: any, res: any) {
    try {
      const url = new URL(req.url);

      const filters: any = {
        page: Number(url.searchParams.get("page")) || 1,
        limit: Number(url.searchParams.get("limit")) || 10,
      };

      const venta_id = url.searchParams.get("venta_id");
      if (venta_id) filters.venta_id = Number(venta_id);

      const estado = url.searchParams.get("estado");
      if (estado) filters.estado = estado;

      const usuario_id = url.searchParams.get("usuario_id");
      if (usuario_id) filters.usuario_id = usuario_id;

      const fechaInicio = url.searchParams.get("fechaInicio");
      if (fechaInicio) filters.fechaInicio = new Date(fechaInicio);

      const fechaFin = url.searchParams.get("fechaFin");
      if (fechaFin) filters.fechaFin = new Date(fechaFin);

      const estados = await this.estadoVentaService.getByMultipleFilters(
        filters,
      );

      res.status(200).json({
        success: true,
        data: estados,
        count: estados.length,
        filters: filters,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
      manejoDeError("Error en getByMultipleFilters EstadoVenta", error);
    }
  }

  /**
   * Crear múltiples estados (bulk)
   */
  async bulkCreate(req: any, res: any) {
    try {
      const body = req.body;
      const user = (req as any).user;

      // console.log('🔍 [DEBUG] EstadoVentaController.bulkCreate - Datos recibidos:', JSON.stringify(body));

      if (!body.estados || !Array.isArray(body.estados) || body.estados.length === 0) {
        res.status(400).json({
          success: false,
          message: "Se requiere un array de estados",
        });
        return;
      }

      // Preparar datos con usuario_id del token
      const estadosConUsuario = body.estados.map((estado: any) => ({
        ...estado,
        usuario_id: user.id,
      }));

      // console.log('🔍 [DEBUG] EstadoVentaController.bulkCreate - Estados con usuario:', JSON.stringify(estadosConUsuario));

      // Validar cada estado
      const estadosValidos = [];
      const erroresValidacion = [];
      for (const estado of estadosConUsuario) {
        const result = EstadoVentaCreateSchema.safeParse(estado);
        if (result.success) {
          console.log('🔍 [DEBUG] Estado válido:', JSON.stringify(result.data));
          estadosValidos.push(result.data);
        } else {
          console.log('🔍 [DEBUG] Estado inválido:', JSON.stringify(estado), 'Errores:', JSON.stringify(result.error));
          erroresValidacion.push({ estado, error: result.error });
        }
      }

      // console.log('🔍 [DEBUG] Estados válidos encontrados:', estadosValidos.length);
      // console.log('🔍 [DEBUG] Errores de validación:', erroresValidacion.length);

      if (estadosValidos.length === 0) {
        res.status(400).json({
          success: false,
          message: "Ningún estado válido para crear. Verifique que los estados sean válidos.",
          debug: {
            recibidos: body.estados.length,
            errores: erroresValidacion.map(e => ({
              venta_id: e.estado.venta_id,
              estado: e.estado.estado,
              errores: e.error.errors?.map(err => err.message) || []
            }))
          }
        });
        return;
      }

      const result = await this.estadoVentaService.bulkCreate(estadosValidos);

res.status(201).json({
        success: true,
        message: `Se actualizaron ${result.length} estados de venta`,
        data: result,
        count: result.length,
      });
    } catch (error) {
      // console.error('🔍 [DEBUG] Error en bulkCreate:', error);
      res.status(500).json({
        success: false,
        message: "Error al crear estados masivamente",
      });
      manejoDeError("Error en bulkCreate EstadoVenta", error);
    }
  }
}
