/**
 * Servicio de negocio para gestión de ventas
 *
 * Maneja lógica de negocio compleja:
 * - Validación de compatibilidad entre planes y promociones
 * - Asignación automática de SAP
 * - Transformaciones de datos
 * - Integración con servicios relacionados
 *
 * @author Equipo de Desarrollo System-Back-Office
 */
import { VentaModelDB } from "../interface/venta.ts";
import { VentaCreate, VentaUpdate } from "../schemas/venta/Venta.ts";
import { ValidationResult } from "../types/ventaTypes.ts";
import { PlanService } from "./PlanService.ts";
import { PromocionService } from "./PromocionService.ts";
import { CorreoCreate } from "../schemas/correo/Correo.ts";
import { EstadoVentaModelDB } from "../interface/EstadoVenta.ts";
export declare class VentaService {
    private modelVenta;
    private modelEstadoVenta?;
    constructor(modelVenta: VentaModelDB, modelEstadoVenta?: EstadoVentaModelDB);
    getAll(params?: {
        page?: number;
        limit?: number;
    }): Promise<{
        fecha_creacion: Date;
        venta_id: number;
        chip: "SIM" | "ESIM";
        tipo_venta: "PORTABILIDAD" | "LINEA_NUEVA";
        cliente_id: string;
        vendedor_id: string;
        multiple: number;
        plan_id: number;
        empresa_origen_id: number;
        sds?: string | undefined;
        stl?: string | null | undefined;
        sap?: string | null | undefined;
        promocion_id?: number | null | undefined;
    }[] | undefined>;
    getById(id: string): Promise<{
        fecha_creacion: Date;
        venta_id: number;
        chip: "SIM" | "ESIM";
        tipo_venta: "PORTABILIDAD" | "LINEA_NUEVA";
        cliente_id: string;
        vendedor_id: string;
        multiple: number;
        plan_id: number;
        empresa_origen_id: number;
        sds?: string | undefined;
        stl?: string | null | undefined;
        sap?: string | null | undefined;
        promocion_id?: number | null | undefined;
    } | undefined>;
    getBySDS(sds: string): Promise<{
        fecha_creacion: Date;
        venta_id: number;
        chip: "SIM" | "ESIM";
        tipo_venta: "PORTABILIDAD" | "LINEA_NUEVA";
        cliente_id: string;
        vendedor_id: string;
        multiple: number;
        plan_id: number;
        empresa_origen_id: number;
        sds?: string | undefined;
        stl?: string | null | undefined;
        sap?: string | null | undefined;
        promocion_id?: number | null | undefined;
    } | undefined>;
    getBySAP(sap: string): Promise<{
        fecha_creacion: Date;
        venta_id: number;
        chip: "SIM" | "ESIM";
        tipo_venta: "PORTABILIDAD" | "LINEA_NUEVA";
        cliente_id: string;
        vendedor_id: string;
        multiple: number;
        plan_id: number;
        empresa_origen_id: number;
        sds?: string | undefined;
        stl?: string | null | undefined;
        sap?: string | null | undefined;
        promocion_id?: number | null | undefined;
    } | undefined>;
    create(input: VentaCreate, usuarioId: string): Promise<{
        fecha_creacion: Date;
        venta_id: number;
        chip: "SIM" | "ESIM";
        tipo_venta: "PORTABILIDAD" | "LINEA_NUEVA";
        cliente_id: string;
        vendedor_id: string;
        multiple: number;
        plan_id: number;
        empresa_origen_id: number;
        sds?: string | undefined;
        stl?: string | null | undefined;
        sap?: string | null | undefined;
        promocion_id?: number | null | undefined;
    }>;
    update(id: string, input: VentaUpdate): Promise<{
        fecha_creacion: Date;
        venta_id: number;
        chip: "SIM" | "ESIM";
        tipo_venta: "PORTABILIDAD" | "LINEA_NUEVA";
        cliente_id: string;
        vendedor_id: string;
        multiple: number;
        plan_id: number;
        empresa_origen_id: number;
        sds?: string | undefined;
        stl?: string | null | undefined;
        sap?: string | null | undefined;
        promocion_id?: number | null | undefined;
    } | undefined>;
    delete(id: string): Promise<boolean>;
    getByVendedor(vendedor: string): Promise<{
        fecha_creacion: Date;
        venta_id: number;
        chip: "SIM" | "ESIM";
        tipo_venta: "PORTABILIDAD" | "LINEA_NUEVA";
        cliente_id: string;
        vendedor_id: string;
        multiple: number;
        plan_id: number;
        empresa_origen_id: number;
        sds?: string | undefined;
        stl?: string | null | undefined;
        sap?: string | null | undefined;
        promocion_id?: number | null | undefined;
    }[]>;
    getByCliente(cliente: string): Promise<{
        fecha_creacion: Date;
        venta_id: number;
        chip: "SIM" | "ESIM";
        tipo_venta: "PORTABILIDAD" | "LINEA_NUEVA";
        cliente_id: string;
        vendedor_id: string;
        multiple: number;
        plan_id: number;
        empresa_origen_id: number;
        sds?: string | undefined;
        stl?: string | null | undefined;
        sap?: string | null | undefined;
        promocion_id?: number | null | undefined;
    }[]>;
    getByPlan(plan: number): Promise<{
        fecha_creacion: Date;
        venta_id: number;
        chip: "SIM" | "ESIM";
        tipo_venta: "PORTABILIDAD" | "LINEA_NUEVA";
        cliente_id: string;
        vendedor_id: string;
        multiple: number;
        plan_id: number;
        empresa_origen_id: number;
        sds?: string | undefined;
        stl?: string | null | undefined;
        sap?: string | null | undefined;
        promocion_id?: number | null | undefined;
    }[]>;
    getByDateRange(start: Date, end: Date): Promise<{
        fecha_creacion: Date;
        venta_id: number;
        chip: "SIM" | "ESIM";
        tipo_venta: "PORTABILIDAD" | "LINEA_NUEVA";
        cliente_id: string;
        vendedor_id: string;
        multiple: number;
        plan_id: number;
        empresa_origen_id: number;
        sds?: string | undefined;
        stl?: string | null | undefined;
        sap?: string | null | undefined;
        promocion_id?: number | null | undefined;
    }[]>;
    getStatistics(): Promise<{
        totalVentas: number;
        ventasPorPlan: Array<{
            plan_id: number;
            plan_nombre: string;
            cantidad: number;
        }>;
        ventasPorVendedor: Array<{
            vendedor_id: string;
            vendedor_nombre: string;
            cantidad: number;
        }>;
        ventasPorMes: Array<{
            mes: string;
            cantidad: number;
        }>;
    }>;
    validateDates(start: string, end: string): ValidationResult;
    /**
     * Valida que el plan existe y pertenece a la empresa origen
     *
     * Verifica:
     * - Existencia del plan
     * - Compatibilidad con empresa origen
     *
     * @param planId ID del plan a validar
     * @param empresaOrigenId ID de la empresa origen
     * @param planService Servicio de planes para consultas
     * @returns Resultado de validación con errores si aplica
     */
    validatePlan(planId: number, empresaOrigenId: number, planService: PlanService): Promise<ValidationResult>;
    /**
     * Valida que la promoción existe y pertenece a la empresa origen
     *
     * Verifica:
     * - Existencia de la promoción
     * - Compatibilidad con empresa origen
     *
     * @param promocionId ID de la promoción a validar
     * @param empresaOrigenId ID de la empresa origen
     * @param promocionService Servicio de promociones para consultas
     * @returns Resultado de validación con errores si aplica
     */
    validatePromocion(promocionId: number, empresaOrigenId: number, promocionService: PromocionService): Promise<ValidationResult>;
    /**
     * Asigna automáticamente el SAP de la venta basado en el correo
     *
     * Reglas:
     * - Si es SIM con correo válido, usa correo.sap_id
     * - De lo contrario, mantiene el SAP original o null
     *
     * @param ventaData Datos de la venta sin vendedor_id
     * @param correo Datos del correo (opcional)
     * @returns Datos de venta con SAP actualizado
     */
    assignSap(ventaData: Omit<VentaCreate, "vendedor_id">, correo?: CorreoCreate): Omit<VentaCreate, "vendedor_id">;
    /**
     * Obtiene ventas optimizadas para UI con JOINs completos
     * Incluyen datos del cliente, vendedor, supervisor, plan, promoción y empresa origen
     */
    getVentasUI(params: {
        page?: number;
        limit?: number;
        startDate?: string;
        endDate?: string;
        search?: string;
        userId?: string;
        userRol?: string;
    }): Promise<{
        ventas: any[];
        total: number;
        page: number;
        limit: number;
    }>;
    /**
     * Obtiene el detalle completo de una venta
     * Incluye cliente, vendedor, supervisor, plan, promoción, empresa origen,
     * portabilidad/línea nueva, historial de estados, historial de correo,
     * comentarios y datos del correo
     */
    getVentaDetalleCompleto(ventaId: number): Promise<any>;
}
//# sourceMappingURL=VentaService.d.ts.map