import { PortabilidadModelDB } from "../interface/Portabilidad.ts";
import { Portabilidad, PortabilidadCreate } from "../schemas/venta/Portabilidad.ts";
import { PostgresClient } from "../database/PostgreSQL.ts";
export declare class PortabilidadPostgreSQL implements PortabilidadModelDB {
    connection: PostgresClient;
    constructor(connection: PostgresClient);
    private safeQuery;
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
}
//# sourceMappingURL=portabilidadPostgreSQL.d.ts.map