import client from "../../database/MySQL.ts";
import { EmpresaOrigenModelDB, EmpresaOrigen, EmpresaOrigenCreate } from "../../interface/EmpresaOrigen.ts";
export declare class EmpresaOrigenMySQL implements EmpresaOrigenModelDB {
    connection: typeof client;
    constructor(connection: typeof client);
    getAll(params?: {
        page?: number;
        limit?: number;
    }): Promise<EmpresaOrigen[]>;
    getById({ id }: {
        id: string;
    }): Promise<EmpresaOrigen | undefined>;
    add({ input }: {
        input: EmpresaOrigenCreate;
    }): Promise<EmpresaOrigen>;
    update({ id, input }: {
        id: string;
        input: Partial<EmpresaOrigen>;
    }): Promise<EmpresaOrigen | undefined>;
    delete({ id }: {
        id: string;
    }): Promise<boolean>;
}
//# sourceMappingURL=empresaOrigenMySQL.d.ts.map