import { PlanModelDB } from "../interface/Plan.ts";
import { Plan, PlanCreate } from "../schemas/venta/Plan.ts";
import { PostgresClient } from "../database/PostgreSQL.ts";
export declare class PlanPostgreSQL implements PlanModelDB {
    connection: PostgresClient;
    constructor(connection: PostgresClient);
    private safeQuery;
    getAll(params?: {
        page?: number;
        limit?: number;
    }): Promise<Plan[]>;
    getById({ id }: {
        id: string;
    }): Promise<Plan | undefined>;
    getByNombre({ nombre }: {
        nombre: string;
    }): Promise<Plan | undefined>;
    add({ input }: {
        input: PlanCreate;
    }): Promise<Plan>;
    update({ id, input }: {
        id: string;
        input: Partial<Plan>;
    }): Promise<Plan | undefined>;
    delete({ id }: {
        id: string;
    }): Promise<boolean>;
    getByEmpresa({ empresa }: {
        empresa: number;
    }): Promise<Plan[]>;
}
//# sourceMappingURL=planPostgreSQL.d.ts.map