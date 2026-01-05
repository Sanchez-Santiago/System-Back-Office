import { Venta, VentaCreate } from "../schemas/venta/Venta.ts";
import { ModelDB } from "./model.ts";

export interface VentaModelDB extends Omit<ModelDB<Venta>, 'add'> {
  add(params: { input: VentaCreate }): Promise<Venta>;
  getBySDS: ({ sds }: { sds: string }) => Promise<Venta | undefined>;

  getBySPN: ({ spn }: { spn: string }) => Promise<Venta | undefined>;

  getBySAP: ({ sap }: { sap: string }) => Promise<Venta | undefined>;

  getByVendedor: ({ vendedor }: { vendedor: string }) => Promise<Venta[]>;

  getByCliente: ({ cliente }: { cliente: string }) => Promise<Venta[]>;

  getByPlan: ({ plan }: { plan: number }) => Promise<Venta[]>;

  getByDateRange: ({ start, end }: { start: Date; end: Date }) => Promise<Venta[]>;

  getStatistics: () => Promise<{
    totalVentas: number;
    ventasPorPlan: Array<{ plan_id: number; plan_nombre: string; cantidad: number }>;
    ventasPorVendedor: Array<{ vendedor_id: string; vendedor_nombre: string; cantidad: number }>;
    ventasPorMes: Array<{ mes: string; cantidad: number }>;
  }>;
}