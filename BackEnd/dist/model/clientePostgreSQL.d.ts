import { ClienteUpdate } from "../schemas/persona/Cliente.ts";
import { ClienteModelDB } from "../interface/Cliente.ts";
import { Cliente, ClienteCreate, ClienteResponse } from "../schemas/persona/Cliente.ts";
import { PostgresClient } from "../database/PostgreSQL.ts";
export declare class ClientePostgreSQL implements ClienteModelDB {
    connection: PostgresClient;
    constructor(connection: PostgresClient);
    private logSuccess;
    private logError;
    getAll(params?: {
        page?: number;
        limit?: number;
    }): Promise<Cliente[]>;
    getById({ id }: {
        id: string;
    }): Promise<Cliente | undefined>;
    getByPersonaId({ personaId }: {
        personaId: string;
    }): Promise<Cliente | undefined>;
    getWithPersonaData({ personaId }: {
        personaId: string;
    }): Promise<ClienteResponse | undefined>;
    getAllWithPersonaData(params?: {
        page?: number;
        limit?: number;
    }): Promise<ClienteResponse[]>;
    getByDocumento({ tipo_documento, documento }: {
        tipo_documento: string;
        documento: string;
    }): Promise<ClienteResponse | undefined>;
    add({ input }: {
        input: ClienteCreate;
    }): Promise<Cliente>;
    update({ id, input }: {
        id: string;
        input: ClienteUpdate;
    }): Promise<Cliente | undefined>;
    delete({ id }: {
        id: string;
    }): Promise<boolean>;
}
//# sourceMappingURL=clientePostgreSQL.d.ts.map