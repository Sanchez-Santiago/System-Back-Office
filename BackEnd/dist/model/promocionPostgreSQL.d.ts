import { PromocionModelDB } from "../interface/Promocion.ts";
import { Promocion, PromocionCreate } from "../schemas/venta/Promocion.ts";
import { PostgresClient } from "../database/PostgreSQL.ts";
export declare class PromocionPostgreSQL implements PromocionModelDB {
    connection: PostgresClient;
    constructor(connection: PostgresClient);
    private safeQuery;
    getAll(params?: {
        page?: number;
        limit?: number;
    }): Promise<Promocion[]>;
    getById({ id }: {
        id: string;
    }): Promise<Promocion | undefined>;
    getByNombre({ nombre }: {
        nombre: string;
    }): Promise<Promocion | undefined>;
    getByEmpresa({ empresa }: {
        empresa: string;
    }): Promise<Promocion[]>;
    add({ input }: {
        input: PromocionCreate;
    }): Promise<Promocion>;
    update({ id, input }: {
        id: string;
        input: Partial<Promocion>;
    }): Promise<Promocion | undefined>;
    delete({ id }: {
        id: string;
    }): Promise<boolean>;
}
//# sourceMappingURL=promocionPostgreSQL.d.ts.map