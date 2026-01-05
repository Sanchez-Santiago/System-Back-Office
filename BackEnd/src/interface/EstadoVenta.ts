import { EstadoVenta, EstadoVentaCreate, EstadoVentaUpdate } from "../schemas/venta/EstadoVenta.ts";
import { ModelDB } from "./model.ts";

export interface EstadoVentaModelDB extends Omit<ModelDB<EstadoVenta>, 'add' | 'getById' | 'update' | 'delete'> {
  add(params: { input: EstadoVentaCreate }): Promise<EstadoVenta>;

  getAll(params?: { page?: number; limit?: number }): Promise<EstadoVenta[]>;

  getById({ id }: { id: string }): Promise<EstadoVenta | undefined>;

  update({ id, input }: { id: string; input: EstadoVentaUpdate }): Promise<boolean>;

  delete({ id }: { id: string }): Promise<boolean>;

  getByVentaId({ venta_id }: { venta_id: number }): Promise<EstadoVenta[]>;
}