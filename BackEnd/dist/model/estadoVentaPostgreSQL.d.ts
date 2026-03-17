import { EstadoVentaModelDB } from "../interface/EstadoVenta.ts";
import { EstadoVenta, EstadoVentaCreate, EstadoVentaUpdate } from "../schemas/venta/EstadoVenta.ts";
import { PostgresClient } from "../database/PostgreSQL.ts";
export declare class EstadoVentaPostgreSQL implements EstadoVentaModelDB {
    connection: PostgresClient;
    constructor(connection: PostgresClient);
    private logSuccess;
    private logWarning;
    private logError;
    private mapRowToEstadoVenta;
    getAll(params?: {
        page?: number;
        limit?: number;
    }): Promise<EstadoVenta[]>;
    getById({ id }: {
        id: string;
    }): Promise<EstadoVenta | undefined>;
    getByVentaId({ venta_id }: {
        venta_id: number;
    }): Promise<EstadoVenta[]>;
    /**
     * Obtiene el último estado de una venta (el más reciente)
     */
    getLastByVentaId({ venta_id }: {
        venta_id: number;
    }): Promise<EstadoVenta | undefined>;
    add({ input }: {
        input: EstadoVentaCreate;
    }): Promise<EstadoVenta>;
    update({ id, input }: {
        id: string;
        input: EstadoVentaUpdate;
    }): Promise<boolean>;
    delete({ id }: {
        id: string;
    }): Promise<boolean>;
    /**
     * Obtiene el último estado de cada venta (el más reciente por venta)
     */
    getLastStateForAllVentas(): Promise<EstadoVenta[]>;
    /**
     * Obtiene el último estado de cada venta
     * Alias de getLastStateForAllVentas para compatibilidad
     */
    getAllLastEstado(): Promise<EstadoVenta[]>;
    /**
     * Obtiene el estado actual de una venta (alias de getLastByVentaId)
     */
    getEstadoActualByVentaId({ venta_id }: {
        venta_id: number;
    }): Promise<EstadoVenta | undefined>;
    /**
     * Filtra estados por rango de fechas
     */
    getByFechaRango(params: {
        fechaInicio: Date;
        fechaFin: Date;
    }): Promise<EstadoVenta[]>;
    /**
     * Filtra estados por tipo de estado específico
     */
    getByEstado({ estado }: {
        estado: string;
    }): Promise<EstadoVenta[]>;
    /**
     * Obtiene estadísticas generales de los estados
     */
    getEstadisticasGenerales(): Promise<{
        totalEstados: number;
        estadosPorTipo: Array<{
            estado: string;
            cantidad: number;
        }>;
        estadosPorMes: Array<{
            mes: string;
            cantidad: number;
        }>;
    }>;
    /**
     * Filtra con múltiples parámetros opcionales
     */
    getByMultipleFilters(params: {
        venta_id?: number;
        estado?: string;
        fechaInicio?: Date;
        fechaFin?: Date;
        usuario_id?: string;
        page?: number;
        limit?: number;
    }): Promise<EstadoVenta[]>;
    /**
     * Creación masiva de estados para optimizar rendimiento
     * Versión CORREGIDA con transacciones y validaciones optimizadas
     */
    bulkCreateEstados(estados: EstadoVentaCreate[]): Promise<EstadoVenta[]>;
    /**
     * Valida múltiples venta_ids en una sola query
     */
    private validateVentaIdsBulk;
    /**
     * Valida múltiples usuario_ids en una sola query
     */
    private validateUsuarioIdsBulk;
    /**
     * Valida múltiples estados en una sola query
     */
    private validateEstadosBulk;
    /**
     * Verifica que la venta exista en la tabla venta
     */
    private validateVentaId;
    /**
     * Verifica que el usuario exista y esté activo
     */
    private validateUsuarioId;
    /**
     * Verifica que el estado sea válido según el enum
     * Normaliza el estado reemplazando guiones bajos por espacios
     */
    private validateEstado;
}
//# sourceMappingURL=estadoVentaPostgreSQL.d.ts.map