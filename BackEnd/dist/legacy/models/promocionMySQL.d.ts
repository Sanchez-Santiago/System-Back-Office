import client from "../../database/MySQL.ts";
import { PromocionModelDB } from "../../interface/Promocion.ts";
import { Promocion, PromocionCreate } from "../../schemas/venta/Promocion.ts";
export declare class PromocionMySQL implements PromocionModelDB {
    connection: typeof client;
    constructor(connection: typeof client);
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
//# sourceMappingURL=promocionMySQL.d.ts.map