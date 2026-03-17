import { ClienteModelDB } from "../interface/Cliente.ts";
import { ClienteUpdate } from "../schemas/persona/Cliente.ts";
import { ClienteCreate } from "../schemas/persona/Cliente.ts";
export declare class ClienteService {
    private modeCliente;
    constructor(modeCliente: ClienteModelDB);
    getAll(params?: {
        page?: number;
        limit?: number;
    }): Promise<{
        persona_id: string;
    }[] | undefined>;
    getById(id: string): Promise<{
        persona_id: string;
    } | undefined>;
    getWithPersonaData(personaId: string): Promise<{
        nombre: string;
        apellido: string;
        fecha_nacimiento: Date;
        documento: string;
        email: string;
        persona_id: string;
        telefono?: string | undefined;
        telefono_alternativo?: string | undefined;
    } | undefined>;
    getAllWithPersonaData(params?: {
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
    getByDocumento(tipo_documento: string, documento: string): Promise<{
        nombre: string;
        apellido: string;
        fecha_nacimiento: Date;
        documento: string;
        email: string;
        persona_id: string;
        telefono?: string | undefined;
        telefono_alternativo?: string | undefined;
    } | undefined>;
    create(input: ClienteCreate): Promise<{
        persona_id: string;
    }>;
    update(id: string, input: ClienteUpdate): Promise<{
        persona_id: string;
    } | undefined>;
    delete(id: string): Promise<boolean>;
}
//# sourceMappingURL=ClienteService.d.ts.map