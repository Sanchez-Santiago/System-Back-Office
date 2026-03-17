import client from "../../database/MySQL.ts";
import { EstadoVentaModelDB } from "../../interface/EstadoVenta.ts";
import { EstadoVenta, EstadoVentaCreate, EstadoVentaUpdate } from "../../schemas/venta/EstadoVenta.ts";
export declare class EstadoVentaMySQL implements EstadoVentaModelDB {
    connection: typeof client;
    constructor(connection: typeof client);
    private mapRowToEstadoVenta;
    getAll(params?: {
        page?: number;
        limit?: number;
    }): Promise<EstadoVenta[]>;
    getById({ id }: {
        id: string;
    }): Promise<EstadoVenta | undefined>;
    getByVentaId({ venta_id }: {
        venta_id: number;
    }): Promise<EstadoVenta[]>;
    add({ input }: {
        input: EstadoVentaCreate;
    }): Promise<EstadoVenta>;
    update({ id, input }: {
        id: string;
        input: EstadoVentaUpdate;
    }): Promise<boolean>;
    delete({ id }: {
        id: string;
    }): Promise<boolean>;
}
//# sourceMappingURL=estadoVentaMySQL.d.ts.map