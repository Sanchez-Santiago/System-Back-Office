/**
 * Controlador para gestión de ventas en el sistema telecom
 *
 * Maneja operaciones CRUD de ventas incluyendo:
 * - Creación completa de ventas (líneas nuevas y portabilidades)
 * - Validaciones de negocio y compatibilidad
 * - Gestión de estados y estadísticas
 * - Integración con correo y promociones
 *
 * @author Equipo de Desarrollo System-Back-Office
 */
import { VentaCreate, VentaUpdate } from "../schemas/venta/Venta.ts";
import { DateRangeQuery, PaginationQuery, VentaRequest, VentaResponse, VentaUpdateRequest } from "../types/ventaTypes.ts";
import { DBVenta } from "../interface/venta.ts";
import { VentaModelDB } from "../interface/venta.ts";
import { ClienteModelDB } from "../interface/Cliente.ts";
import { CorreoModelDB } from "../interface/correo.ts";
import { PortabilidadModelDB } from "../interface/Portabilidad.ts";
import { LineaNuevaModelDB } from "../interface/LineaNueva.ts";
import { PlanModelDB } from "../interface/Plan.ts";
import { PromocionModelDB } from "../interface/Promocion.ts";
import { EstadoVentaModelDB } from "../interface/EstadoVenta.ts";
export declare class VentaController {
    private ventaService;
    private clienteService;
    private planService;
    private promocionService;
    private correoController;
    private correoService;
    private portabilidadController;
    private lineaNuevaController;
    /**
     * Constructor del controlador de ventas
     * @param ventaModel Modelo para operaciones de ventas
     * @param clienteModel Modelo para validación de clientes
     * @param correoModel Modelo para gestión de correos
     * @param lineaNuevaModel Modelo para líneas nuevas
     * @param portabilidadModel Modelo para portabilidades
     * @param planModel Modelo para validación de planes
     * @param promocionModel Modelo para validación de promociones
     * @param estadoVentaModel Modelo para gestión de estados de venta
     */
    constructor(ventaModel: VentaModelDB, clienteModel: ClienteModelDB, correoModel: CorreoModelDB, lineaNuevaModel: LineaNuevaModelDB, portabilidadModel: PortabilidadModelDB, planModel: PlanModelDB, promocionModel: PromocionModelDB, estadoVentaModel: EstadoVentaModelDB);
    getAll(input: {
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
    getById(input: {
        id: string;
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
    } | undefined>;
    getBySDS(input: {
        sds: string;
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
    } | undefined>;
    getBySAP(input: {
        sap: string;
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
    } | undefined>;
    create(input: {
        venta: VentaCreate;
        userId: string;
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
    }>;
    update(input: {
        id: string;
        venta: VentaUpdate;
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
    } | undefined>;
    delete(input: {
        id: string;
    }): Promise<boolean>;
    getByVendedor(input: {
        vendedor: string;
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
    }[]>;
    getByCliente(input: {
        cliente: string;
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
    }[]>;
    getByPlan(input: {
        plan: number;
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
    }[]>;
    getByDateRange(input: {
        start: Date;
        end: Date;
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
    getVentasWithPagination(query: PaginationQuery): Promise<VentaResponse<DBVenta[]>>;
    getVentaByDateRange(query: DateRangeQuery): Promise<VentaResponse<DBVenta[]>>;
    getVentaByParam(param: string, type: "sds" | "sap" | "vendedor" | "cliente" | "plan"): Promise<VentaResponse<DBVenta>>;
    updateVenta(request: VentaUpdateRequest): Promise<VentaResponse<DBVenta>>;
    /**
     * Crea una venta completa incluyendo validaciones y entidades relacionadas
     *
     * ESTRATEGIA OPTIMIZADA:
     * 1. VALIDAR TODO PRIMERO (sin crear nada en BD)
     * 2. CREAR TODO AL FINAL (solo si todas las validaciones pasaron)
     *
     * Proceso completo:
     * FASE 1 - VALIDACIONES (sin tocar BD):
     *   1.1. Validación de estructura y datos básicos
     *   1.2. Asignación de SAP para correos
     *   1.3. Validación de reglas de negocio (chip/correo)
     *   1.4. Validación de correo con Zod
     *   1.5. Verificación de cliente existe
     *   1.6. Validación de venta con Zod
     *   1.7. Validación de plan pertenece a empresa
     *   1.8. Validación de promoción pertenece a empresa
     *   1.9. Verificación de SAP no duplicado
     *
     * FASE 2 - CREACIÓN (solo si TODO validó):
     *   2.1. Crear correo (si es SIM)
     *   2.2. Crear venta
     *   2.3. Post-procesamiento (portabilidad o línea nueva)
     *
     * @param request Datos de la venta con correo y portabilidad opcionales
     * @param userId ID del usuario que crea la venta
     * @returns Resultado de la creación con datos de la venta
     * @throws Error si hay problemas de validación o BD
     */
    createFullVenta(request: VentaRequest, userId: string): Promise<VentaResponse<DBVenta>>;
    /**
     * Realiza rollback del correo creado en caso de error de BD
     * Elimina el correo y sus estados asociados
     *
     * NOTA: Este método solo se llama si hubo un error DESPUÉS de crear el correo
     * (no durante las validaciones, ya que esas se hacen antes de crear nada)
     *
     * @param sapId SAP ID del correo a eliminar
     * @param reason Razón del rollback para logging
     */
    private rollbackCorreo;
    /**
     * Post-procesamiento de venta: crea portabilidad o línea nueva según tipo
     *
     * @param venta Venta creada con su ID
     * @param portabilidad Datos de portabilidad si aplica
     */
    private postProcessVenta;
    /**
     * Obtiene ventas optimizadas para UI
     * Router → Controller → Service → Model
     */
    getVentasUI(req: any, res: any): Promise<void>;
    /**
     * Obtiene el detalle completo de una venta
     * Router → Controller → Service → Model
     */
    getVentaDetalleCompleto(req: any, res: any): Promise<void>;
}
//# sourceMappingURL=VentaController.d.ts.map