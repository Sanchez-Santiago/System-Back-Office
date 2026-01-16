/**
 * Controlador para gestión de ventas en el sistema telecom
 *
 * Maneja operaciones CRUD de ventas incluyendo:
 * - Creación completa de ventas (líneas nuevas y portabilidades)
 * - Validaciones de negocio y compatibilidad
 * - Gestión de estados y estadísticas
 * - Integración con correo y promociones
 *
 * @author Equipo de Desarrollo System-Back-Office
 */

// BackEnd/src/Controller/VentaController.ts
// ============================================
import { logger } from "../Utils/logger.ts";
import { VentaService } from "../services/VentaService.ts";
import { ClienteService } from "../services/ClienteService.ts";
import {
  VentaCreate,
  VentaCreateSchema,
  VentaUpdate,
  VentaUpdateSchema,
} from "../schemas/venta/Venta.ts";
import {
  DateRangeQuery,
  PaginationQuery,
  VentaRequest,
  VentaResponse,
  VentaUpdateRequest,
} from "../types/ventaTypes.ts";
import { DBVenta } from "../interface/venta.ts";
import { PlanService } from "../services/PlanService.ts";
import { PromocionService } from "../services/PromocionService.ts";
import { CorreoController } from "./CorreoController.ts";
import { PortabilidadController } from "./PortabilidadController.ts";
import { LineaNuevaController } from "./LineaNuevaController.ts";
import { VentaModelDB } from "../interface/venta.ts";
import { ClienteModelDB } from "../interface/Cliente.ts";
import { CorreoModelDB } from "../interface/correo.ts";
import { PortabilidadModelDB } from "../interface/Portabilidad.ts";
import { LineaNuevaModelDB } from "../interface/LineaNueva.ts";
import { PlanModelDB } from "../interface/Plan.ts";
import { PromocionModelDB } from "../interface/Promocion.ts";
import { EstadoVentaController } from "./EstadoVentaController.ts";
import { EstadoVentaService } from "../services/EstadoVentaService.ts";
import { EstadoVentaMySQL } from "../model/estadoVentaMySQL.ts";
import client from "../database/MySQL.ts";
import { CorreoCreateSchema } from "../schemas/correo/Correo.ts";
import { PortabilidadCreate } from "../schemas/venta/Portabilidad.ts";

export class VentaController {
  private ventaService: VentaService;
  private clienteService: ClienteService;
  private planService: PlanService;
  private promocionService: PromocionService;
  private correoController: CorreoController;
  private portabilidadController: PortabilidadController;
  private lineaNuevaController: LineaNuevaController;

  /**
   * Constructor del controlador de ventas
   * @param ventaModel Modelo para operaciones de ventas
   * @param clienteModel Modelo para validación de clientes
   * @param correoModel Modelo para gestión de correos
   * @param lineaNuevaModel Modelo para líneas nuevas
   * @param portabilidadModel Modelo para portabilidades
   * @param planModel Modelo para validación de planes
   * @param promocionModel Modelo para validación de promociones
   */
  constructor(
    ventaModel: VentaModelDB,
    clienteModel: ClienteModelDB,
    correoModel: CorreoModelDB,
    lineaNuevaModel: LineaNuevaModelDB,
    portabilidadModel: PortabilidadModelDB,
    planModel: PlanModelDB,
    promocionModel: PromocionModelDB,
  ) {
    this.planService = new PlanService(planModel);
    this.promocionService = new PromocionService(promocionModel);
    this.ventaService = new VentaService(ventaModel);
    this.clienteService = new ClienteService(clienteModel);
    const estadoVentaModel = new EstadoVentaMySQL(client);
    const estadoVentaService = new EstadoVentaService(estadoVentaModel);
    const estadoVentaController = new EstadoVentaController(estadoVentaService);
    this.correoController = new CorreoController(correoModel);
    this.lineaNuevaController = new LineaNuevaController(
      lineaNuevaModel,
      ventaModel,
      portabilidadModel,
    );
    this.portabilidadController = new PortabilidadController(
      portabilidadModel,
      ventaModel,
      lineaNuevaModel,
    );
  }

  async getAll(input: { page?: number; limit?: number }) {
    try {
      const ventas = await this.ventaService.getAll(input);
      return ventas;
    } catch (error) {
      logger.error("VentaController.getAll:", error);
      throw error;
    }
  }

  async getById(input: { id: string }) {
    try {
      const venta = await this.ventaService.getById(input.id);
      return venta;
    } catch (error) {
      logger.error("VentaController.getById:", error);
      throw error;
    }
  }

  async getBySDS(input: { sds: string }) {
    try {
      const venta = await this.ventaService.getBySDS(input.sds);
      return venta;
    } catch (error) {
      logger.error("VentaController.getBySDS:", error);
      throw error;
    }
  }

  async getBySAP(input: { sap: string }) {
    try {
      const venta = await this.ventaService.getBySAP(input.sap);
      return venta;
    } catch (error) {
      logger.error("VentaController.getBySAP:", error);
      throw error;
    }
  }

  async create(input: { venta: VentaCreate }) {
    try {
      // Verificar que el cliente existe
      const cliente = await this.clienteService.getById(input.venta.cliente_id);
      if (!cliente) {
        throw new Error("Cliente no existe");
      }

      // Verificar que empresa_origen_id existe
      if (input.venta.empresa_origen_id) {
        // TODO: Agregar validación de empresa_origen_id usando EmpresaOrigenService
        // Por ahora confiamos en que el FK lo valide en BD
      }

      const newVenta = await this.ventaService.create(input.venta);
      return newVenta;
    } catch (error) {
      logger.error("VentaController.create:", error);
      throw error;
    }
  }

  async update(input: { id: string; venta: VentaUpdate }) {
    try {
      const updatedVenta = await this.ventaService.update(
        input.id,
        input.venta,
      );
      return updatedVenta;
    } catch (error) {
      logger.error("VentaController.update:", error);
      throw error;
    }
  }

  async delete(input: { id: string }) {
    try {
      const deleted = await this.ventaService.delete(input.id);
      return deleted;
    } catch (error) {
      logger.error("VentaController.delete:", error);
      throw error;
    }
  }

  async getByVendedor(input: { vendedor: string }) {
    try {
      const ventas = await this.ventaService.getByVendedor(input.vendedor);
      return ventas;
    } catch (error) {
      logger.error("VentaController.getByVendedor:", error);
      throw error;
    }
  }

  async getByCliente(input: { cliente: string }) {
    try {
      const ventas = await this.ventaService.getByCliente(input.cliente);
      return ventas;
    } catch (error) {
      logger.error("VentaController.getByCliente:", error);
      throw error;
    }
  }

  async getByPlan(input: { plan: number }) {
    try {
      const ventas = await this.ventaService.getByPlan(input.plan);
      return ventas;
    } catch (error) {
      logger.error("VentaController.getByPlan:", error);
      throw error;
    }
  }

  async getByDateRange(input: { start: Date; end: Date }) {
    try {
      const ventas = await this.ventaService.getByDateRange(
        input.start,
        input.end,
      );
      return ventas;
    } catch (error) {
      logger.error("VentaController.getByDateRange:", error);
      throw error;
    }
  }

  async getStatistics() {
    try {
      const stats = await this.ventaService.getStatistics();
      return stats;
    } catch (error) {
      logger.error("VentaController.getStatistics:", error);
      throw error;
    }
  }

  async getVentasWithPagination(
    query: PaginationQuery,
  ): Promise<VentaResponse<DBVenta[]>> {
    try {
      const ventas = await this.ventaService.getAll(query) || [];
      const total = ventas.length; // Assuming the model returns all, but in real implementation, model should handle count.
      return {
        success: true,
        data: ventas as DBVenta[],
        pagination: { page: query.page, limit: query.limit, total },
      };
    } catch (error) {
      logger.error("VentaController.getVentasWithPagination:", error);
      throw error;
    }
  }

  async getVentaByDateRange(
    query: DateRangeQuery,
  ): Promise<VentaResponse<DBVenta[]>> {
    try {
      const validation = this.ventaService.validateDates(
        query.start.toISOString(),
        query.end.toISOString(),
      );
      if (!validation.isValid) {
        return { success: false, message: validation.errors?.join(", ") };
      }
      const ventas = await this.ventaService.getByDateRange(
        query.start,
        query.end,
      );
      return { success: true, data: ventas as DBVenta[] };
    } catch (error) {
      logger.error("VentaController.getVentaByDateRange:", error);
      throw error;
    }
  }

  async getVentaByParam(
    param: string,
    type: "sds" | "sap" | "vendedor" | "cliente" | "plan",
  ): Promise<VentaResponse<DBVenta>> {
    try {
      let venta;
      switch (type) {
        case "sds":
          venta = await this.ventaService.getBySDS(param);
          break;
        case "sap":
          venta = await this.ventaService.getBySAP(param);
          break;
        case "vendedor":
          venta = await this.ventaService.getByVendedor(param);
          break;
        case "cliente":
          venta = await this.ventaService.getByCliente(param);
          break;
        case "plan":
          venta = await this.ventaService.getByPlan(Number(param));
          break;
        default:
          return { success: false, message: "Tipo de búsqueda inválido" };
      }
      if (!venta) {
        return { success: false, message: "Venta no encontrada" };
      }
      return { success: true, data: venta as DBVenta };
    } catch (error) {
      logger.error(
        `VentaController.getVentaByParam (${type}):`,
        error,
      );
      throw error;
    }
  }

  async updateVenta(
    request: VentaUpdateRequest,
  ): Promise<VentaResponse<DBVenta>> {
    try {
      const result = VentaUpdateSchema.safeParse(request.venta);
      if (!result.success) {
        return {
          success: false,
          message: "Validación fallida",
          errors: result.error.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        };
      }
      const updatedVenta = await this.ventaService.update(
        request.id,
        result.data,
      );
      return { success: true, data: updatedVenta };
    } catch (error) {
      logger.error("VentaController.updateVenta:", error);
      throw error;
    }
  }

  /**
   * Crea una venta completa incluyendo validaciones y entidades relacionadas
   *
   * Proceso completo:
   * 1. Validación de estructura y datos básicos
   * 2. Asignación de SAP para correos
   * 3. Validaciones de negocio (cliente, plan, promoción)
   * 4. Creación de correo si es SIM
   * 5. Creación de venta en BD
   * 6. Post-procesamiento (portabilidad o línea nueva)
   *
   * @param request Datos de la venta con correo y portabilidad opcionales
   * @param userId ID del usuario que crea la venta
   * @returns Resultado de la creación con datos de la venta
   * @throws Error si hay problemas de validación o BD
   */
  async createFullVenta(
    request: VentaRequest,
    userId: string,
  ): Promise<VentaResponse<DBVenta>> {
    try {
      logger.info("Iniciando createFullVenta");
       // Paso 1: Validar estructura básica de la request
      if (!request.venta) {
        logger.debug("Estructura básica inválida");
        return {
          success: false,
          message: "Estructura de datos inválida. Se requiere { venta: {...} }",
        };
      }

       // Paso 2: Asignar SAP automáticamente si es SIM con correo
      const ventaData = this.ventaService.assignSap(
        request.venta,
        request.correo,
      );
      logger.info(`SAP asignado: ${ventaData.sap || "null"}`);

       // Paso 3: Validar reglas de negocio para chip y correo
       // ESIM no requiere envío físico, SIM sí
       if (ventaData.chip === "ESIM" && request.correo) {
         logger.debug("ESIM con correo - inválido");
         return {
           success: false,
           message: "Para chip ESIM, no se permite información de correo",
         };
       }
       if (ventaData.chip === "SIM" && (!request.correo || !ventaData.sap)) {
         logger.debug("SIM sin correo o SAP - inválido");
         return {
           success: false,
           message: "Para chip SIM, se requiere información de correo completa con SAP",
         };
       }

      // Procesar correo si aplica
      let sapCorreo;
      if (ventaData.chip === "SIM" && request.correo) {
        logger.info("Procesando correo");
        // Verificar si existe
        try {
          const existing = await this.correoController.getBySAP({
            sap: request.correo.sap_id,
          });
          if (existing) {
            return {
              success: false,
              message:
                `Ya existe un correo registrado para SAP: ${request.correo.sap_id}`,
            };
          }
        } catch (error) {
          // No existe, continuar
        }

        // Validar correo
        const correoResult = CorreoCreateSchema.safeParse(request.correo);
        if (!correoResult.success) {
          return {
            success: false,
            message: "Validación fallida en datos de correo",
            errors: correoResult.error.errors.map((e) => ({
              field: e.path.join("."),
              message: e.message,
            })),
          };
        }

        // Crear correo
        try {
          logger.info("Creando correo...");
          const nuevoCorreo = await this.correoController.create(
            correoResult.data,
          );
          logger.info(
            `Correo creado automáticamente para SAP: ${nuevoCorreo.sap_id}`,
          );
          sapCorreo = nuevoCorreo;

          logger.info("Correo creado exitosamente");
        } catch (error) {
          logger.error("Falló creación de correo:", error);
          return {
            success: false,
            message: `Error al crear correo: ${(error as Error).message}`,
          };
        }
      }

      // Verificar cliente
      const cliente = await this.clienteService.getById(ventaData.cliente_id);
      if (!cliente) {
        return { success: false, message: "Cliente no existe" };
      }

      // Agregar vendedor_id
      const ventaWithUser = {
        ...ventaData,
        vendedor_id: userId,
        sap: sapCorreo?.sap_id,
      };

      // Validar con Zod
      const result = VentaCreateSchema.safeParse(ventaWithUser);
      if (!result.success) {
        return {
          success: false,
          message: "Validación fallida",
          errors: result.error.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        };
      }
      let idEmpreesaLN: number;
      if (result.data.tipo_venta === "LINEA_NUEVA") {
        idEmpreesaLN = 2; // id de la empresa que se usa para linea nueva
      } else {
        idEmpreesaLN = result.data.empresa_origen_id;
      }
      // Validar plan y promoción
      if (result.data.plan_id) {
        const planValidation = await this.ventaService.validatePlan(
          result.data.plan_id,
          idEmpreesaLN,
          this.planService,
        );
        if (!planValidation.isValid) {
          return { success: false, message: planValidation.errors?.join(", ") };
        }
      }

      if (result.data.promocion_id) {
        const promoValidation = await this.ventaService.validatePromocion(
          result.data.promocion_id,
          idEmpreesaLN,
          this.promocionService,
        );
        if (!promoValidation.isValid) {
          return {
            success: false,
            message: promoValidation.errors?.join(", "),
          };
        }
      }

      // Crear venta
      const newVenta = await this.ventaService.create(result.data);
      logger.info("Venta creada exitosamente");

      // Post-procesamiento
      await this.postProcessVenta(newVenta, request?.portabilidad);

      return { success: true, data: newVenta };
    } catch (error) {
      logger.error("VentaController.createFullVenta:", error);
      throw error;
    }
  }

  private async postProcessVenta(
    venta: VentaCreate & { venta_id: number },
    portabilidad?: PortabilidadCreate,
  ): Promise<void> {
    logger.debug(
      `Procesando venta ${venta.venta_id} de tipo ${venta.tipo_venta}`,
    );

    if (venta.tipo_venta === "PORTABILIDAD" && portabilidad) {
      logger.debug(
        `Creando portabilidad para venta ${venta.venta_id}`,
      );

      const portaNew: PortabilidadCreate = {
        venta: venta.venta_id,
        spn: portabilidad.spn,
        empresa_origen: venta.empresa_origen_id,
        mercado_origen: portabilidad.mercado_origen,
        numero_porta: portabilidad.numero_porta,
        pin: portabilidad.pin ?? null,
        fecha_portacion: portabilidad.fecha_portacion,
      };

      logger.debug(portaNew);

      await this.portabilidadController.create({
        portabilidad: portaNew,
      });
    } else if (venta.tipo_venta === "LINEA_NUEVA" && !portabilidad) {
      logger.debug(
        `Creando línea nueva para venta ${venta.venta_id}`,
      );
      await this.lineaNuevaController.create({
        lineaNueva: { venta: venta.venta_id },
      });
    }

    logger.debug(
      `Post-procesamiento completado para venta ${venta.venta_id}`,
    );
  }
}
