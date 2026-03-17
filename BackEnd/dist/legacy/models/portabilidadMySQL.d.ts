import client from "../../database/MySQL.ts";
import { PortabilidadModelDB } from "../../interface/Portabilidad.ts";
import { Portabilidad, PortabilidadCreate } from "../../schemas/venta/Portabilidad.ts";
export declare class PortabilidadMySQL implements PortabilidadModelDB {
    connection: typeof client;
    constructor(connection: typeof client);
    getAll(params?: {
        page?: number;
        limit?: number;
    }): Promise<Portabilidad[]>;
    getById({ id }: {
        id: number;
    }): Promise<Portabilidad | undefined>;
    add({ input }: {
        input: PortabilidadCreate;
    }): Promise<Portabilidad>;
    update({ id, input }: {
        id: number;
        input: Partial<Portabilidad>;
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
//# sourceMappingURL=portabilidadMySQL.d.ts.map