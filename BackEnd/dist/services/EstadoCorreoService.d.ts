import { EstadoCorreoModelDB } from "../interface/estadoCorreo.ts";
import { EstadoCorreo, EstadoCorreoCreate, EstadoCorreoUpdate } from "../schemas/correo/EstadoCorreo.ts";
/**
 * Servicio de Estado de Correo
 * Gestiona la lógica de negocio para el tracking de correos
 */
export declare class EstadoCorreoService {
    private model;
    constructor(model: EstadoCorreoModelDB);
    /**
     * Obtiene todos los estados con paginación
     */
    getAll(params: {
        page?: number;
        limit?: number;
    }): Promise<EstadoCorreo[] | undefined>;
    /**
     * Obtiene un estado por ID
     */
    getById({ id }: {
        id: number;
    }): Promise<EstadoCorreo | undefined>;
    /**
     * Obtiene TODO el historial de estados de un correo por SAP
     */
    getBySAP({ sap }: {
        sap: string;
    }): Promise<EstadoCorreo[]>;
    getLastBySAP({ sap }: {
        sap: string;
    }): Promise<EstadoCorreo | undefined>;
    /**
     * Crea un nuevo estado de correo
     */
    create(input: EstadoCorreoCreate): Promise<EstadoCorreo>;
    /**
     * Actualiza un estado existente
     */
    update(params: {
        id: number;
        input: Partial<EstadoCorreoUpdate>;
    }): Promise<EstadoCorreo | undefined>;
    /**
     * Elimina un estado
     */
    delete(params: {
        id: number;
    }): Promise<void>;
    /**
     * Obtiene correos entregados (estado = 'ENTREGADO')
     */
    getEntregados(): Promise<EstadoCorreo[]>;
    /**
     * Obtiene correos no entregados (estado = 'NO ENTREGADO')
     */
    getNoEntregados(): Promise<EstadoCorreo[]>;
    /**
     * Obtiene correos devueltos (estado = 'DEVUELTO AL CLIENTE')
     */
    getDevueltos(): Promise<EstadoCorreo[]>;
    /**
     * Obtiene correos en tránsito (estado = 'EN TRANSITO')
     */
    getEnTransito(): Promise<EstadoCorreo[]>;
    /**
     * Obtiene correos asignados (estado = 'ASIGNADO')
     */
    getAsignados(): Promise<EstadoCorreo[]>;
    /**
     * Obtiene correos por estado específico
     */
    getByEstado({ estado }: {
        estado: string;
    }): Promise<EstadoCorreo[]>;
    /**
     * Marca un correo como entregado
     */
    marcarComoEntregado({ id }: {
        id: number;
    }): Promise<EstadoCorreo | undefined>;
    /**
     * Actualiza la ubicación actual de un correo
     */
    actualizarUbicacion(params: {
        id: number;
        ubicacion: string;
    }): Promise<EstadoCorreo | undefined>;
    /**
     * Obtiene estadísticas de estados
     */
    getStats(): Promise<{
        total: number;
        entregados: number;
        noEntregados: number;
        devueltos: number;
        enTransito: number;
        asignados: number;
        porcentajeEntrega: number;
    }>;
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
     * Crear múltiples estados de correo (bulk)
     */
    bulkCreate(estados: EstadoCorreoCreate[]): Promise<EstadoCorreo[]>;
}
//# sourceMappingURL=EstadoCorreoService.d.ts.map