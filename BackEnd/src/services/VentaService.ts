// BackEnd/src/services/VentaService.ts
// ============================================
import { VentaModelDB } from "../interface/venta.ts";
import { VentaCreate, VentaUpdate } from "../schemas/venta/Venta.ts";

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
}
