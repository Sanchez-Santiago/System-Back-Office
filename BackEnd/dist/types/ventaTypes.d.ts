import { VentaCreate, VentaUpdate } from "../schemas/venta/Venta.ts";
import { CorreoCreate } from "../schemas/correo/Correo.ts";
import { PortabilidadCreate } from "../schemas/venta/Portabilidad.ts";
/**
 * Request para crear una venta completa
 * Incluye datos de venta, correo opcional y portabilidad opcional
 */
export interface VentaRequest {
    venta: Omit<VentaCreate, "vendedor_id">;
    correo?: CorreoCreate;
    portabilidad?: PortabilidadCreate;
}
/**
 * Response genérico para operaciones de venta
 * @template T Tipo de datos en la respuesta (DBVenta, DBVenta[], etc.)
 */
export type VentaResponse<T = unknown> = {
    success: boolean;
    data?: T;
    message?: string;
    errors?: {
        field: string;
        message: string;
    }[];
    pagination?: {
        page: number;
        limit: number;
        total: number;
    };
};
export interface PaginationQuery {
    page: number;
    limit: number;
}
export interface DateRangeQuery {
    start: Date;
    end: Date;
}
export interface VentaUpdateRequest {
    id: string;
    venta: VentaUpdate;
}
export interface ValidationResult {
    isValid: boolean;
    errors?: string[];
}
//# sourceMappingURL=ventaTypes.d.ts.map