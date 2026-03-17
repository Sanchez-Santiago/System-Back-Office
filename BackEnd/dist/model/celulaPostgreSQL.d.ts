import { CelulaModelDB, Celula, CelulaCreate } from "../interface/Celula.ts";
import { PostgresClient } from "../database/PostgreSQL.ts";
export declare class CelulaPostgreSQL implements CelulaModelDB {
    connection: PostgresClient;
    constructor(connection: PostgresClient);
    private safeQuery;
    getAll(params?: {
        page?: number;
        limit?: number;
    }): Promise<Celula[]>;
    getById({ id }: {
        id: number;
    }): Promise<Celula | undefined>;
    getByEmpresa({ empresa }: {
        empresa: number;
    }): Promise<Celula[]>;
    getAsesoresByCelula({ id_celula }: {
        id_celula: number;
    }): Promise<any[]>;
    checkExists({ id }: {
        id: number;
    }): Promise<boolean>;
    add({ input }: {
        input: CelulaCreate;
    }): Promise<Celula>;
    update({ id, input }: {
        id: number;
        input: Partial<Celula>;
    }): Promise<Celula | undefined>;
    delete({ id }: {
        id: number;
    }): Promise<boolean>;
}
//# sourceMappingURL=celulaPostgreSQL.d.ts.map