import { CorreoModelDB } from "../interface/correo.ts";
import { Correo, CorreoCreate, CorreoUpdate } from "../schemas/correo/Correo.ts";
import { PostgresClient } from "../database/PostgreSQL.ts";
/**
 * Modelo de Correo para PostgreSQL con manejo resiliente
 * Gestiona todas las operaciones CRUD para correos/envíos
 */
export declare class CorreoPostgreSQL implements CorreoModelDB {
    connection: PostgresClient;
    constructor(connection: PostgresClient);
    private logSuccess;
    private logWarning;
    private logError;
    private readonly baseSelect;
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
    /**
     * Obtiene correos por código postal
     */
    getByCodigoPostal({ codigoPostal }: {
        codigoPostal: number;
    }): Promise<Correo[]>;
    /**
     * Cuenta total de correos
     */
    count(): Promise<number>;
    /**
     * Cuenta correos por estado (requiere join con estado_correo)
     */
    countByEstado({ estado }: {
        estado: string;
    }): Promise<number>;
}
//# sourceMappingURL=correoPostgreSQL.d.ts.map