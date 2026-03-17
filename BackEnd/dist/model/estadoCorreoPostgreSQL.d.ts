import { EstadoCorreo, EstadoCorreoCreate, EstadoCorreoUpdate } from "../schemas/correo/EstadoCorreo.ts";
import { PostgresClient } from "../database/PostgreSQL.ts";
import { EstadoCorreoModelDB } from "../interface/estadoCorreo.ts";
export declare class EstadoCorreoPostgreSQL implements EstadoCorreoModelDB {
    connection: PostgresClient;
    constructor(connection: PostgresClient);
    private logInfo;
    private logWarn;
    private logError;
    private readonly baseSelect;
    getAll(): Promise<EstadoCorreo[]>;
    getById({ id }: {
        id: number;
    }): Promise<EstadoCorreo | undefined>;
    getBySAP({ sap }: {
        sap: string;
    }): Promise<EstadoCorreo[]>;
    getLastBySAP({ sap }: {
        sap: string;
    }): Promise<EstadoCorreo | undefined>;
    getEntregados(): Promise<EstadoCorreo[]>;
    getNoEntregados(): Promise<EstadoCorreo[]>;
    getDevueltos(): Promise<EstadoCorreo[]>;
    getEnTransito(): Promise<EstadoCorreo[]>;
    getAsignados(): Promise<EstadoCorreo[]>;
    getByEstado({ estado }: {
        estado: string;
    }): Promise<EstadoCorreo[]>;
    getByFechaRango({ fechaInicio, fechaFin }: {
        fechaInicio: Date;
        fechaFin: Date;
    }): Promise<EstadoCorreo[]>;
    getByUbicacion({ ubicacion }: {
        ubicacion: string;
    }): Promise<EstadoCorreo[]>;
    add({ input }: {
        input: EstadoCorreoCreate;
    }): Promise<EstadoCorreo>;
    update({ id, input }: {
        id: number;
        input: EstadoCorreoUpdate;
    }): Promise<EstadoCorreo | undefined>;
    delete({ id }: {
        id: number;
    }): Promise<boolean>;
    marcarComoEntregado({ id }: {
        id: number;
    }): Promise<EstadoCorreo | undefined>;
    actualizarUbicacion({ id, ubicacion }: {
        id: number;
        ubicacion: string;
    }): Promise<EstadoCorreo | undefined>;
    countByEstado({ estado }: {
        estado: string;
    }): Promise<number>;
    countBySAP({ sap_id }: {
        sap_id: string;
    }): Promise<number>;
    bulkCreateEstados(estados: EstadoCorreoCreate[]): Promise<EstadoCorreo[]>;
}
//# sourceMappingURL=estadoCorreoPostgreSQL.d.ts.map