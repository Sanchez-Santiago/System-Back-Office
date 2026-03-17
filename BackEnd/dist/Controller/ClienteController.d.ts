import { ClienteCreate, ClienteUpdate } from "../schemas/persona/Cliente.ts";
import { ClienteService } from "../services/ClienteService.ts";
export declare class ClienteController {
    private clienteService;
    constructor(clienteService: ClienteService);
    getAll(params: {
        page?: number;
        limit?: number;
    }): Promise<{
        persona_id: string;
    }[] | undefined>;
    getById(input: {
        id: string;
    }): Promise<{
        persona_id: string;
    } | undefined>;
    getWithPersonaData(input: {
        personaId: string;
    }): Promise<{
        nombre: string;
        apellido: string;
        fecha_nacimiento: Date;
        documento: string;
        email: string;
        persona_id: string;
        telefono?: string | undefined;
        telefono_alternativo?: string | undefined;
    } | undefined>;
    getAllWithPersonaData(params: {
        page?: number;
        limit?: number;
    }): Promise<{
        nombre: string;
        apellido: string;
        fecha_nacimiento: Date;
        documento: string;
        email: string;
        persona_id: string;
        telefono?: string | undefined;
        telefono_alternativo?: string | undefined;
    }[]>;
    getByDocumento(input: {
        tipo_documento: string;
        documento: string;
    }): Promise<{
        nombre: string;
        apellido: string;
        fecha_nacimiento: Date;
        documento: string;
        email: string;
        persona_id: string;
        telefono?: string | undefined;
        telefono_alternativo?: string | undefined;
    } | undefined>;
    create(input: {
        cliente: ClienteCreate;
    }): Promise<{
        persona_id: string;
    }>;
    update(input: {
        id: string;
        cliente: ClienteUpdate;
    }): Promise<{
        persona_id: string;
    } | undefined>;
    delete(input: {
        id: string;
    }): Promise<boolean>;
}
//# sourceMappingURL=ClienteController.d.ts.map