import { PersonaModelDB } from "../../interface/Persona.ts";
import { Persona } from "../../schemas/persona/Persona.ts";
import clients from "../../database/MySQL.ts";
export declare class PersonaModelMySQL implements PersonaModelDB {
    connection: typeof clients;
    constructor();
    getAll(params: {
        page?: number;
        limit?: number;
        email?: string;
    }): Promise<Persona[] | undefined>;
    getById({ id }: {
        id: string;
    }): Promise<Persona | undefined>;
    add({ input }: {
        input: Persona;
    }): Promise<Persona>;
    update({ id, input, }: {
        id: string;
        input: Partial<Persona>;
    }): Promise<Persona | undefined>;
    delete({ id }: {
        id: string;
    }): Promise<boolean>;
    getByEmail({ email }: {
        email: string;
    }): Promise<Persona | undefined>;
    getBydocumento({ documento }: {
        documento: string;
    }): Promise<Persona | undefined>;
}
//# sourceMappingURL=personaMySQL.d.ts.map