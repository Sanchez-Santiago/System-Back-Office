import 'dotenv/config';
import { EstadoCorreoModelDB } from "../interface/estadoCorreo.ts";
import { EstadoCorreo, EstadoCorreoCreate, EstadoCorreoUpdate } from "../schemas/correo/EstadoCorreo.ts";
/**
 * Controlador de Estado de Correo
 * Coordina las operaciones de tracking y seguimiento
 */
export declare class EstadoCorreoController {
    private service;
    constructor(model: EstadoCorreoModelDB);
    /**
     * GET ALL - Obtiene todos los estados
     */
    getAll(params: {
        page?: number;
        limit?: number;
    }): Promise<EstadoCorreo[]>;
    /**
     * GET BY ID - Obtiene un estado específico
     */
    getById({ id }: {
        id: number;
    }): Promise<EstadoCorreo>;
    /**
     * GET BY SAP - Obtiene HISTORIAL COMPLETO de un correo
     */
    getBySAP({ sap }: {
        sap: string;
    }): Promise<EstadoCorreo[]>;
    getLastBySAP({ sap }: {
        sap: string;
    }): Promise<EstadoCorreo | undefined>;
    /**
     * CREATE - Crea un nuevo estado
     */
    create(input: EstadoCorreoCreate): Promise<EstadoCorreo>;
    /**
     * UPDATE - Actualiza un estado existente
     */
    update(params: {
        id: number;
        input: Partial<EstadoCorreoUpdate>;
    }): Promise<EstadoCorreo>;
    /**
     * DELETE - Elimina un estado permanentemente
     */
    delete({ id }: {
        id: number;
    }): Promise<void>;
    /**
     * GET ENTREGADOS - Obtiene correos entregados (estado = 'ENTREGADO')
     */
    getEntregados(): Promise<EstadoCorreo[]>;
    /**
     * GET NO ENTREGADOS - Obtiene correos no entregados (estado = 'NO ENTREGADO')
     */
    getNoEntregados(): Promise<EstadoCorreo[]>;
    /**
     * GET DEVUELTOS - Obtiene correos devueltos (estado = 'DEVUELTO AL CLIENTE')
     */
    getDevueltos(): Promise<EstadoCorreo[]>;
    /**
     * GET EN TRANSITO - Obtiene correos en tránsito (estado = 'EN TRANSITO')
     */
    getEnTransito(): Promise<EstadoCorreo[]>;
    /**
     * GET ASIGNADOS - Obtiene correos asignados (estado = 'ASIGNADO')
     */
    getAsignados(): Promise<EstadoCorreo[]>;
    /**
     * GET BY ESTADO - Obtiene correos por estado específico
     */
    getByEstado({ estado }: {
        estado: string;
    }): Promise<EstadoCorreo[]>;
    /**
     * MARCAR COMO ENTREGADO - Marca un correo como entregado
     */
    marcarComoEntregado({ id }: {
        id: number;
    }): Promise<EstadoCorreo>;
    /**
     * ACTUALIZAR UBICACIÓN - Actualiza la ubicación de un correo
     */
    actualizarUbicacion(params: {
        id: number;
        ubicacion: string;
    }): Promise<EstadoCorreo>;
    /**
     * GET STATS - Obtiene estadísticas de estados
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
     * GET BY FECHA RANGO - Obtiene estados por rango de fechas
     */
    getByFechaRango(params: {
        fechaInicio: Date;
        fechaFin: Date;
    }): Promise<EstadoCorreo[]>;
    /**
     * GET BY UBICACIÓN - Obtiene estados por ubicación
     */
    getByUbicacion({ ubicacion }: {
        ubicacion: string;
    }): Promise<EstadoCorreo[]>;
    /**
     * Crear múltiples estados de correo (bulk)
     */
    bulkCreate(ctx: any): Promise<void>;
}
//# sourceMappingURL=EstadoCorreoController.d.ts.map