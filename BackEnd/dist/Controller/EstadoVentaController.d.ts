import 'dotenv/config';
import { EstadoVentaService } from "../services/EstadoVentaService.ts";
export declare class EstadoVentaController {
    private estadoVentaService;
    constructor(estadoVentaService: EstadoVentaService);
    /**
     * Obtener todos los estados con paginación
     */
    getAll(req: any, res: any): Promise<void>;
    /**
     * Obtener estado por ID
     */
    getById(req: any, res: any): Promise<void>;
    /**
     * Obtener todos los estados de una venta específica
     */
    getByVentaId(req: any, res: any): Promise<void>;
    /**
     * Obtener el último estado de una venta específica
     */
    getLastByVentaId(req: any, res: any): Promise<void>;
    /**
     * Obtener el último estado de todas las ventas
     */
    getAllLastEstado(req: any, res: any): Promise<void>;
    /**
     * Crear un nuevo estado
     */
    create(req: any, res: any): Promise<void>;
    /**
     * Actualizar un estado existente
     */
    update(req: any, res: any): Promise<void>;
    /**
     * Eliminar un estado
     */
    delete(req: any, res: any): Promise<void>;
    /**
     * Obtener estados por tipo/estado específico
     */
    getByEstado(req: any, res: any): Promise<void>;
    /**
     * Obtener estados por rango de fechas
     */
    getByFechaRango(req: any, res: any): Promise<void>;
    /**
     * Filtrado avanzado con múltiples parámetros
     */
    getByMultipleFilters(req: any, res: any): Promise<void>;
    /**
     * Crear múltiples estados (bulk)
     */
    bulkCreate(req: any, res: any): Promise<void>;
}
//# sourceMappingURL=EstadoVentaController.d.ts.map