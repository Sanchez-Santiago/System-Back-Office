// BackEnd/src/services/VentaService.ts
// ============================================
import { VentaModelDB } from "../interface/venta.ts";
import { VentaCreate, VentaUpdate } from "../schemas/venta/Venta.ts";
import { DateRangeQuery, ValidationResult } from "../types/ventaTypes.ts";
import { PlanService } from "./PlanService.ts";
import { PromocionService } from "./PromocionService.ts";
import { CorreoCreate } from "../schemas/correo/Correo.ts";
import { PortabilidadCreate } from "../schemas/venta/Portabilidad.ts";

export class VentaService {
  private modeVenta: VentaModelDB;

  constructor(modeVenta: VentaModelDB) {
    this.modeVenta = modeVenta;
  }

  async getAll(params: { page?: number; limit?: number } = {}) {
    try {
      const ventas = await this.modeVenta.getAll(params);
      return ventas;
    } catch (error) {
      console.error("[ERROR] VentaService.getAll:", error);
      throw error;
    }
  }

  async getById(id: string) {
    try {
      const venta = await this.modeVenta.getById({ id });
      return venta;
    } catch (error) {
      console.error("[ERROR] VentaService.getById:", error);
      throw error;
    }
  }

  async getBySDS(sds: string) {
    try {
      const venta = await this.modeVenta.getBySDS({ sds });
      return venta;
    } catch (error) {
      console.error("[ERROR] VentaService.getBySDS:", error);
      throw error;
    }
  }

  async getBySAP(sap: string) {
    try {
      const venta = await this.modeVenta.getBySAP({ sap });
      return venta;
    } catch (error) {
      console.error("[ERROR] VentaService.getBySAP:", error);
      throw error;
    }
  }

  async create(input: VentaCreate) {
    try {
      const newVenta = await this.modeVenta.add({ input });
      return newVenta;
    } catch (error) {
      console.error("[ERROR] VentaService.create:", error);
      throw error;
    }
  }

  async update(id: string, input: VentaUpdate) {
    try {
      const updatedVenta = await this.modeVenta.update({ id, input });
      return updatedVenta;
    } catch (error) {
      console.error("[ERROR] VentaService.update:", error);
      throw error;
    }
  }

  async delete(id: string) {
    try {
      const deleted = await this.modeVenta.delete({ id });
      return deleted;
    } catch (error) {
      console.error("[ERROR] VentaService.delete:", error);
      throw error;
    }
  }

  async getByVendedor(vendedor: string) {
    try {
      const ventas = await this.modeVenta.getByVendedor({ vendedor });
      return ventas;
    } catch (error) {
      console.error("[ERROR] VentaService.getByVendedor:", error);
      throw error;
    }
  }

  async getByCliente(cliente: string) {
    try {
      const ventas = await this.modeVenta.getByCliente({ cliente });
      return ventas;
    } catch (error) {
      console.error("[ERROR] VentaService.getByCliente:", error);
      throw error;
    }
  }

  async getByPlan(plan: number) {
    try {
      const ventas = await this.modeVenta.getByPlan({ plan });
      return ventas;
    } catch (error) {
      console.error("[ERROR] VentaService.getByPlan:", error);
      throw error;
    }
  }

  async getByDateRange(start: Date, end: Date) {
    try {
      const ventas = await this.modeVenta.getByDateRange({ start, end });
      return ventas;
    } catch (error) {
      console.error("[ERROR] VentaService.getByDateRange:", error);
      throw error;
    }
  }

  async getStatistics() {
    try {
      const stats = await this.modeVenta.getStatistics();
      return stats;
    } catch (error) {
      console.error("[ERROR] VentaService.getStatistics:", error);
      throw error;
    }
  }

  validateDates(start: string, end: string): ValidationResult {
    const errors: string[] = [];
    if (!start || !end) {
      errors.push("Parámetros 'start' y 'end' son requeridos");
      return { isValid: false, errors };
    }
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      errors.push("Fechas inválidas");
      return { isValid: false, errors };
    }
    return { isValid: true };
  }

  async validatePlan(
    planId: number,
    empresaOrigenId: number,
    planService: PlanService,
  ): Promise<ValidationResult> {
    const errors: string[] = [];
    const plan = await planService.getById(planId.toString());
    if (!plan) {
      errors.push(`El plan ${planId} no existe`);
      return { isValid: false, errors };
    }
    if (plan.empresa_origen_id !== empresaOrigenId) {
      errors.push("El plan no corresponde a la empresa origen especificada");
      return { isValid: false, errors };
    }
    return { isValid: true };
  }

  async validatePromocion(
    promocionId: number,
    empresaOrigenId: number,
    promocionService: PromocionService,
  ): Promise<ValidationResult> {
    const errors: string[] = [];
    const promocion = await promocionService.getById(promocionId.toString());
    if (!promocion) {
      errors.push(`La promoción ${promocionId} no existe`);
      return { isValid: false, errors };
    }
    if (promocion.empresa_origen_id !== empresaOrigenId) {
      errors.push(
        "La promoción no corresponde a la empresa origen especificada",
      );
      return { isValid: false, errors };
    }
    return { isValid: true };
  }

  assignSap(
    ventaData: Omit<VentaCreate, "vendedor_id">,
    correo?: CorreoCreate,
  ): Omit<VentaCreate, "vendedor_id"> {
    if (
      correo &&
      ventaData.chip === "SIM" &&
      ventaData.sap && correo.sap_id
    ) {
      return { ...ventaData, sap: correo.sap_id };
    }
    return ventaData;
  }
}
