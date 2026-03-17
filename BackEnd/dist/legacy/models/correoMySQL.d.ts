import { CorreoModelDB } from "../../interface/correo.ts";
import { Correo, CorreoCreate, CorreoUpdate } from "../../schemas/correo/Correo.ts";
import { Client } from "mysql";
/**
 * Modelo de Correo para MySQL
 * Gestiona todas las operaciones CRUD para correos/envíos
 */
export declare class CorreoMySQL implements CorreoModelDB {
    connection: Client;
    constructor(connection: Client);
    getAll(params: {
        page?: number;
        limit?: number;
        name?: string;
        email?: string;
    }): Promise<Correo[] | undefined>;
    getById({ id }: {
        id: string;
    }): Promise<Correo | undefined>;
    getBySAP({ sap }: {
        sap: string;
    }): Promise<Correo | undefined>;
    add(params: {
        input: CorreoCreate;
    }): Promise<Correo>;
    update(params: {
        id: string;
        input: Partial<CorreoUpdate>;
    }): Promise<Correo | undefined>;
    delete(params: {
        id: string;
    }): Promise<boolean>;
    /**
     * Obtiene correos por localidad
     */
    getByLocalidad({ localidad }: {
        localidad: string;
    }): Promise<Correo[]>;
    /**
     * Obtiene correos por departamento
     */
    getByDepartamento({ departamento }: {
        departamento: string;
    }): Promise<Correo[]>;
    /**
     * Obtiene correos próximos a vencer (fecha límite cercana)
     */
    getProximosAVencer({ dias }: {
        dias?: number;
    }): Promise<Correo[]>;
    /**
     * Obtiene correos vencidos
     */
    getVencidos(): Promise<Correo[]>;
}
//# sourceMappingURL=correoMySQL.d.ts.map