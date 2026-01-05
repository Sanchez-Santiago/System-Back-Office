// BackEnd/src/Controller/VentaController.ts
// ============================================
import { VentaCreate, VentaUpdate } from "../schemas/venta/Venta.ts";
import { VentaService } from "../services/VentaService.ts";
import { ClienteService } from "../services/ClienteService.ts";
import { VentaModelDB } from "../interface/venta.ts";
import { ClienteModelDB } from "../interface/Cliente.ts";

export class VentaController {
  private ventaService: VentaService;
  private clienteService: ClienteService;

  constructor(ventaModel: VentaModelDB, clienteModel: ClienteModelDB) {
    this.ventaService = new VentaService(ventaModel);
    this.clienteService = new ClienteService(clienteModel);
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

      const newVenta = await this.ventaService.create(input.venta);
      return newVenta;
    } catch (error) {
      console.error("[ERROR] VentaController.create:", error);
      throw error;
    }
  }

  async update(input: { id: string; venta: VentaUpdate }) {
    try {
      const updatedVenta = await this.ventaService.update(input.id, input.venta);
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
}
