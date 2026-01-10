// BackEnd/src/Controller/VentaController.ts
// ============================================
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
      console.error("[ERROR] VentaController.getAll:", error);
      throw error;
    }
  }

  async getById(input: { id: string }) {
    try {
      const venta = await this.ventaService.getById(input.id);
      return venta;
    } catch (error) {
      console.error("[ERROR] VentaController.getById:", error);
      throw error;
    }
  }

  async getBySDS(input: { sds: string }) {
    try {
      const venta = await this.ventaService.getBySDS(input.sds);
      return venta;
    } catch (error) {
      console.error("[ERROR] VentaController.getBySDS:", error);
      throw error;
    }
  }

  async getBySAP(input: { sap: string }) {
    try {
      const venta = await this.ventaService.getBySAP(input.sap);
      return venta;
    } catch (error) {
      console.error("[ERROR] VentaController.getBySAP:", error);
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
      console.error("[ERROR] VentaController.create:", error);
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
      console.error("[ERROR] VentaController.update:", error);
      throw error;
    }
  }

  async delete(input: { id: string }) {
    try {
      const deleted = await this.ventaService.delete(input.id);
      return deleted;
    } catch (error) {
      console.error("[ERROR] VentaController.delete:", error);
      throw error;
    }
  }

  async getByVendedor(input: { vendedor: string }) {
    try {
      const ventas = await this.ventaService.getByVendedor(input.vendedor);
      return ventas;
    } catch (error) {
      console.error("[ERROR] VentaController.getByVendedor:", error);
      throw error;
    }
  }

  async getByCliente(input: { cliente: string }) {
    try {
      const ventas = await this.ventaService.getByCliente(input.cliente);
      return ventas;
    } catch (error) {
      console.error("[ERROR] VentaController.getByCliente:", error);
      throw error;
    }
  }

  async getByPlan(input: { plan: number }) {
    try {
      const ventas = await this.ventaService.getByPlan(input.plan);
      return ventas;
    } catch (error) {
      console.error("[ERROR] VentaController.getByPlan:", error);
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
      console.error("[ERROR] VentaController.getByDateRange:", error);
      throw error;
    }
  }

  async getStatistics() {
    try {
      const stats = await this.ventaService.getStatistics();
      return stats;
    } catch (error) {
      console.error("[ERROR] VentaController.getStatistics:", error);
      throw error;
    }
  }

  async getVentasWithPagination(
    query: PaginationQuery,
  ): Promise<
    VentaResponse & {
      pagination: { page: number; limit: number; total: number };
    }
  > {
    try {
      const ventas = await this.ventaService.getAll(query) || [];
      const total = ventas.length; // Assuming the model returns all, but in real implementation, model should handle count.
      return {
        success: true,
        data: ventas as any,
        pagination: { page: query.page, limit: query.limit, total },
      };
    } catch (error) {
      console.error("[ERROR] VentaController.getVentasWithPagination:", error);
      throw error;
    }
  }

  async getVentaByDateRange(query: DateRangeQuery): Promise<VentaResponse> {
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
      return { success: true, data: ventas as any };
    } catch (error) {
      console.error("[ERROR] VentaController.getVentaByDateRange:", error);
      throw error;
    }
  }

  async getVentaByParam(
    param: string,
    type: "sds" | "sap" | "vendedor" | "cliente" | "plan",
  ): Promise<VentaResponse> {
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
      return { success: true, data: venta as any };
    } catch (error) {
      console.error(
        `[ERROR] VentaController.getVentaByParam (${type}):`,
        error,
      );
      throw error;
    }
  }

  async updateVenta(request: VentaUpdateRequest): Promise<VentaResponse> {
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
      console.error("[ERROR] VentaController.updateVenta:", error);
      throw error;
    }
  }

  async createFullVenta(
    request: VentaRequest,
    userId: string,
  ): Promise<VentaResponse> {
    try {
      console.log("[INFO] Iniciando createFullVenta");
      // Validar estructura básica
      if (!request.venta) {
        console.log("[VALIDATION ERROR] Estructura básica inválida");
        return {
          success: false,
          message: "Estructura de datos inválida. Se requiere { venta: {...} }",
        };
      }

      // Asignar SAP
      const ventaData = this.ventaService.assignSap(
        request.venta,
        request.correo,
      );
      console.log(`[INFO] SAP asignado: ${ventaData.sap || "null"}`);

      // Validaciones de chip y correo
      if (ventaData.chip === "ESIM" && request.correo) {
        console.log("[VALIDATION ERROR] ESIM con correo");
        return {
          success: false,
          message: "Para chip ESIM, no se permite correo",
        };
      }
      if (ventaData.chip === "SIM" && (!request.correo)) {
        console.log("[VALIDATION ERROR] SIM sin correo o SAP");
        return {
          success: false,
          message: "Para chip SIM, se requiere correo y SAP válidos",
        };
      }

      // Procesar correo si aplica
      let sapCorreo;
      if (ventaData.chip === "SIM" && request.correo) {
        console.log("[INFO] Procesando correo");
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
          console.log("[INFO] Creando correo...");
          const nuevoCorreo = await this.correoController.create(
            correoResult.data,
          );
          console.log(
            `[SUCCESS] Correo creado automáticamente para SAP: ${nuevoCorreo.sap_id}`,
          );
          sapCorreo = nuevoCorreo;

          console.log("Correo creado exitosamente");
        } catch (error) {
          console.error("[ERROR] Falló creación de correo:", error);
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
      console.log("Venta creada exitosamente");

      // Post-procesamiento
      await this.postProcessVenta(newVenta, request?.portabilidad);

      return { success: true, data: newVenta };
    } catch (error) {
      console.error("[ERROR] VentaController.createFullVenta:", error);
      throw error;
    }
  }

  private async postProcessVenta(
    venta: VentaCreate & { venta_id: number },
    portabilidad?: PortabilidadCreate,
  ): Promise<void> {
    console.log(
      `[POST-PROCESS] Procesando venta ${venta.venta_id} de tipo ${venta.tipo_venta}`,
    );

    if (venta.tipo_venta === "PORTABILIDAD" && portabilidad) {
      console.log(
        `[POST-PROCESS] Creando portabilidad para venta ${venta.venta_id}`,
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

      console.log(portaNew);

      await this.portabilidadController.create({
        portabilidad: portaNew,
      });
    } else if (venta.tipo_venta === "LINEA_NUEVA" && !portabilidad) {
      console.log(
        `[POST-PROCESS] Creando línea nueva para venta ${venta.venta_id}`,
      );
      await this.lineaNuevaController.create({
        lineaNueva: { venta: venta.venta_id },
      });
    }

    console.log(
      `[POST-PROCESS] Post-procesamiento completado para venta ${venta.venta_id}`,
    );
  }
}
