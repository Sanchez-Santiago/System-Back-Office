// ============================================
// BackEnd/src/services/EstadoVentaService.ts
// ============================================
import { EstadoVentaModelDB } from "../interface/EstadoVenta.ts";
import { EstadoVenta, EstadoVentaCreate, EstadoVentaUpdate } from "../schemas/venta/EstadoVenta.ts";

export class EstadoVentaService {
  private model: EstadoVentaModelDB;

  constructor(model: EstadoVentaModelDB) {
    this.model = model;
  }

  async getAll(params: { page?: number; limit?: number } = {}): Promise<EstadoVenta[]> {
    return this.model.getAll(params);
  }

  async getById({ id }: { id: string }): Promise<EstadoVenta | undefined> {
    return this.model.getById({ id });
  }

  async getByVentaId({ venta_id }: { venta_id: number }): Promise<EstadoVenta[]> {
    return this.model.getByVentaId({ venta_id });
  }

  async create(input: EstadoVentaCreate): Promise<EstadoVenta> {
    return this.model.add({ input });
  }

  async update({ id, input }: { id: string; input: EstadoVentaUpdate }): Promise<boolean> {
    return this.model.update({ id, input });
  }

  async delete({ id }: { id: string }): Promise<boolean> {
    return this.model.delete({ id });
  }

  async getAllLastEstado(): Promise<EstadoVenta[]> {
    return this.model.getAllLastEstado();
  }
}