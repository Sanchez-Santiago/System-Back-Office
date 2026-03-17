import client from "../../database/MySQL.ts";
import { ClienteUpdate } from "../../schemas/persona/Cliente.ts";
import { ClienteModelDB } from "../../interface/Cliente.ts";
import { Cliente, ClienteCreate, ClienteResponse } from "../../schemas/persona/Cliente.ts";
export declare class ClienteMySQL implements ClienteModelDB {
    connection: typeof client;
    constructor(connection: typeof client);
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
//# sourceMappingURL=clienteMySQL.d.ts.map