import client from "../../database/MySQL.ts";
import { PlanModelDB } from "../../interface/Plan.ts";
import { Plan, PlanCreate } from "../../schemas/venta/Plan.ts";
export declare class PlanMySQL implements PlanModelDB {
    connection: typeof client;
    constructor(connection: typeof client);
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
}
//# sourceMappingURL=planMySQL.d.ts.map