import { PortabilidadModelDB } from "../interface/Portabilidad.ts";
import { Portabilidad, PortabilidadCreate } from "../schemas/venta/Portabilidad.ts";
export declare class PortabilidadService {
    model: PortabilidadModelDB;
    constructor(model: PortabilidadModelDB);
    getAll(params?: {
        page?: number;
        limit?: number;
    }): Promise<Portabilidad[]>;
    getById({ id }: {
        id: number;
    }): Promise<Portabilidad | undefined>;
    create({ portabilidad }: {
        portabilidad: PortabilidadCreate;
    }): Promise<Portabilidad>;
    update({ id, portabilidad }: {
        id: number;
        portabilidad: Partial<Portabilidad>;
    }): Promise<Portabilidad | undefined>;
    delete({ id }: {
        id: number;
    }): Promise<boolean>;
    getByVenta({ venta }: {
        venta: number;
    }): Promise<Portabilidad | undefined>;
    getStatistics(): Promise<{
        total: number;
        byEmpresaOrigen: Array<{
            empresa_origen: string;
            cantidad: number;
        }>;
        byMercadoOrigen: Array<{
            mercado_origen: string;
            cantidad: number;
        }>;
    }>;
    getByEstado({ estado }: {
        estado: string;
    }): Promise<Portabilidad[]>;
}
//# sourceMappingURL=PortabilidadService.d.ts.map