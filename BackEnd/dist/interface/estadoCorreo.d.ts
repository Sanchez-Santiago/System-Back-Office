import { EstadoCorreo, EstadoCorreoCreate } from "../schemas/correo/EstadoCorreo.ts";
export interface EstadoCorreoModelDB {
    connection: unknown;
    getAll(): Promise<EstadoCorreo[]>;
    getById(params: {
        id: number;
    }): Promise<EstadoCorreo | undefined>;
    add(params: {
        input: EstadoCorreoCreate;
    }): Promise<EstadoCorreo>;
    update(params: {
        id: number;
        input: Partial<EstadoCorreo>;
    }): Promise<EstadoCorreo | undefined>;
    delete(params: {
        id: number;
    }): Promise<boolean>;
    getBySAP(params: {
        sap: string;
    }): Promise<EstadoCorreo[]>;
    getLastBySAP(params: {
        sap: string;
    }): Promise<EstadoCorreo | undefined>;
    getEntregados(): Promise<EstadoCorreo[]>;
    getNoEntregados(): Promise<EstadoCorreo[]>;
    getDevueltos(): Promise<EstadoCorreo[]>;
    getEnTransito(): Promise<EstadoCorreo[]>;
    getAsignados(): Promise<EstadoCorreo[]>;
    getByEstado(params: {
        estado: string;
    }): Promise<EstadoCorreo[]>;
    getByFechaRango(params: {
        fechaInicio: Date;
        fechaFin: Date;
    }): Promise<EstadoCorreo[]>;
    getByUbicacion(params: {
        ubicacion: string;
    }): Promise<EstadoCorreo[]>;
    marcarComoEntregado(params: {
        id: number;
    }): Promise<EstadoCorreo | undefined>;
    actualizarUbicacion(params: {
        id: number;
        ubicacion: string;
    }): Promise<EstadoCorreo | undefined>;
    countByEstado(params: {
        estado: string;
    }): Promise<number>;
    countBySAP(params: {
        sap_id: string;
    }): Promise<number>;
    bulkCreateEstados(estados: EstadoCorreoCreate[]): Promise<EstadoCorreo[]>;
}
//# sourceMappingURL=estadoCorreo.d.ts.map