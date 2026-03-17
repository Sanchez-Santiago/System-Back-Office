import { PostgresClient } from "../database/PostgreSQL.ts";
import { VentaModelDB } from "../interface/venta.ts";
import { Venta, VentaCreate } from "../schemas/venta/Venta.ts";
export declare class VentaPostgreSQL implements VentaModelDB {
    connection: PostgresClient;
    constructor(connection: PostgresClient);
    private mapRowToVenta;
    getAll(params?: {
        page?: number;
        limit?: number;
    }): Promise<Venta[]>;
    getById({ id }: {
        id: string;
    }): Promise<Venta | undefined>;
    getBySDS({ sds }: {
        sds: string;
    }): Promise<Venta | undefined>;
    getBySPN({ spn }: {
        spn: string;
    }): Promise<Venta | undefined>;
    getBySAP({ sap }: {
        sap: string;
    }): Promise<Venta | undefined>;
    add({ input }: {
        input: VentaCreate;
    }): Promise<Venta>;
    update({ id, input }: {
        id: string;
        input: Partial<Venta>;
    }): Promise<Venta | undefined>;
    delete({ id }: {
        id: string;
    }): Promise<boolean>;
    getByVendedor({ vendedor }: {
        vendedor: string;
    }): Promise<Venta[]>;
    getByCliente({ cliente }: {
        cliente: string;
    }): Promise<Venta[]>;
    getByPlan({ plan }: {
        plan: number;
    }): Promise<Venta[]>;
    getByDateRange({ start, end }: {
        start: Date;
        end: Date;
    }): Promise<Venta[]>;
    getStatistics(): Promise<{
        totalVentas: number;
        ventasPorPlan: Array<{
            plan_id: number;
            plan_nombre: string;
            cantidad: number;
        }>;
        ventasPorVendedor: Array<{
            vendedor_id: string;
            vendedor_nombre: string;
            cantidad: number;
        }>;
        ventasPorMes: Array<{
            mes: string;
            cantidad: number;
        }>;
    }>;
    getVentasUI(params: {
        page?: number;
        limit?: number;
        startDate?: string;
        endDate?: string;
        search?: string;
        userId?: string;
        userRol?: string;
    }): Promise<{
        ventas: any[];
        total: number;
        page: number;
        limit: number;
    }>;
    getVentaDetalleCompleto(ventaId: number): Promise<any | undefined>;
}
//# sourceMappingURL=ventaPostgreSQL.d.ts.map