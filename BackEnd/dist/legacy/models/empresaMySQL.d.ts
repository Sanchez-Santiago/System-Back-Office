import client from "../../database/MySQL.ts";
import { EmpresaModelDB, Empresa, EmpresaCreate } from "../../interface/Empresa.ts";
export declare class EmpresaMySQL implements EmpresaModelDB {
    connection: typeof client;
    constructor(connection: typeof client);
    getAll(params?: {
        page?: number;
        limit?: number;
    }): Promise<Empresa[]>;
    getById({ id }: {
        id: string;
    }): Promise<Empresa | undefined>;
    add({ input }: {
        input: EmpresaCreate;
    }): Promise<Empresa>;
    update({ id, input }: {
        id: string;
        input: Partial<Empresa>;
    }): Promise<Empresa | undefined>;
    delete({ id }: {
        id: string;
    }): Promise<boolean>;
}
//# sourceMappingURL=empresaMySQL.d.ts.map