import { EstadoCorreoModelDB } from "../../interface/estadoCorreo.ts";
import { EstadoCorreo, EstadoCorreoCreate, EstadoCorreoUpdate } from "../../schemas/correo/EstadoCorreo.ts";
import { Client } from "mysql";
/**
 * Modelo de Estado de Correo para MySQL
 * Gestiona el tracking y seguimiento de correos
 */
export declare class EstadoCorreoMySQL implements EstadoCorreoModelDB {
    connection: Client;
    constructor(connection: Client);
    getAll(params: {
        page?: number;
        limit?: number;
        name?: string;
        email?: string;
    }): Promise<EstadoCorreo[] | undefined>;
    getById({ id }: {
        id: string;
    }): Promise<EstadoCorreo | undefined>;
    getBySAP({ sap }: {
        sap: string;
    }): Promise<EstadoCorreo[] | undefined>;
    getLastBySAP({ sap }: {
        sap: string;
    }): Promise<EstadoCorreo | undefined>;
    getEntregados(): Promise<EstadoCorreo[]>;
    getNoEntregados(): Promise<EstadoCorreo[]>;
    getDevueltos(): Promise<EstadoCorreo[]>;
    add(params: {
        input: EstadoCorreoCreate;
    }): Promise<EstadoCorreo>;
    update(params: {
        id: string;
        input: Partial<EstadoCorreoUpdate>;
    }): Promise<EstadoCorreo | undefined>;
    delete(params: {
        id: string;
    }): Promise<boolean>;
    /**
     * Obtiene estados por rango de fechas
     */
    getByFechaRango(params: {
        fechaInicio: Date;
        fechaFin: Date;
    }): Promise<EstadoCorreo[]>;
    /**
     * Obtiene estados por ubicación
     */
    getByUbicacion({ ubicacion }: {
        ubicacion: string;
    }): Promise<EstadoCorreo[]>;
    /**
     * Marca un correo como entregado
     */
    marcarComoEntregado({ id }: {
        id: string;
    }): Promise<EstadoCorreo | undefined>;
    /**
     * Actualiza ubicación actual
     */
    actualizarUbicacion(params: {
        id: string;
        ubicacion: string;
    }): Promise<EstadoCorreo | undefined>;
}
//# sourceMappingURL=estadoCorreoMySQL.d.ts.map