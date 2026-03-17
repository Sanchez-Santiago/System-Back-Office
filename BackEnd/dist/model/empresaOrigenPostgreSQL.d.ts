import { EmpresaOrigen, EmpresaOrigenCreate, EmpresaOrigenModelDB } from "../interface/EmpresaOrigen.ts";
import { PostgresClient } from "../database/PostgreSQL.ts";
export declare class EmpresaOrigenPostgreSQL implements EmpresaOrigenModelDB {
    connection: PostgresClient;
    constructor(connection: PostgresClient);
    private logSuccess;
    private logWarning;
    private logError;
    getAll(params?: {
        page?: number;
        limit?: number;
    }): Promise<EmpresaOrigen[]>;
    getById({ id }: {
        id: string;
    }): Promise<EmpresaOrigen | undefined>;
    getByNombre({ nombre }: {
        nombre: string;
    }): Promise<EmpresaOrigen | undefined>;
    getByPais({ pais }: {
        pais: string;
    }): Promise<EmpresaOrigen[]>;
    add({ input }: {
        input: EmpresaOrigenCreate;
    }): Promise<EmpresaOrigen>;
    update({ id, input, }: {
        id: string;
        input: Partial<EmpresaOrigen>;
    }): Promise<EmpresaOrigen | undefined>;
    delete({ id }: {
        id: string;
    }): Promise<boolean>;
    count(): Promise<number>;
    search({ query, page, limit, }: {
        query: string;
        page?: number;
        limit?: number;
    }): Promise<EmpresaOrigen[]>;
    getWithStats({ id }: {
        id: string;
    }): Promise<(EmpresaOrigen & {
        planes_count: number;
        promociones_count: number;
    }) | undefined>;
    getAllWithStats({ page, limit, }?: {
        page?: number;
        limit?: number;
    }): Promise<Array<EmpresaOrigen & {
        planes_count: number;
        promociones_count: number;
    }>>;
}
//# sourceMappingURL=empresaOrigenPostgreSQL.d.ts.map