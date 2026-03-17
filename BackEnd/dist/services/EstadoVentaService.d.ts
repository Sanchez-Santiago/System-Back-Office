import { EstadoVentaModelDB } from "../interface/EstadoVenta.ts";
import { EstadoVenta, EstadoVentaCreate, EstadoVentaUpdate } from "../schemas/venta/EstadoVenta.ts";
export declare class EstadoVentaService {
    private model;
    constructor(model: EstadoVentaModelDB);
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
    getLastByVentaId({ venta_id }: {
        venta_id: number;
    }): Promise<EstadoVenta | undefined>;
    getEstadoActualByVentaId({ venta_id }: {
        venta_id: number;
    }): Promise<EstadoVenta | undefined>;
    getByFechaRango(params: {
        fechaInicio: Date;
        fechaFin: Date;
    }): Promise<EstadoVenta[]>;
    getByEstado({ estado }: {
        estado: string;
    }): Promise<EstadoVenta[]>;
    getByMultipleFilters(params: {
        venta_id?: number;
        estado?: string;
        fechaInicio?: Date;
        fechaFin?: Date;
        usuario_id?: string;
        page?: number;
        limit?: number;
    }): Promise<EstadoVenta[]>;
    create(input: EstadoVentaCreate): Promise<EstadoVenta>;
    update({ id, input }: {
        id: string;
        input: EstadoVentaUpdate;
    }): Promise<boolean>;
    delete({ id }: {
        id: string;
    }): Promise<boolean>;
    getAllLastEstado(): Promise<EstadoVenta[]>;
    bulkCreate(estados: EstadoVentaCreate[]): Promise<EstadoVenta[]>;
}
//# sourceMappingURL=EstadoVentaService.d.ts.map