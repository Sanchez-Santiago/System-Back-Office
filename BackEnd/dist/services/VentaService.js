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
import { logger } from "../Utils/logger";
export class VentaService {
    modelVenta;
    modelEstadoVenta;
    constructor(modelVenta, modelEstadoVenta) {
        this.modelVenta = modelVenta;
        this.modelEstadoVenta = modelEstadoVenta;
    }
    async getAll(params = {}) {
        try {
            const ventas = await this.modelVenta.getAll(params);
            return ventas;
        }
        catch (error) {
            logger.error("VentaService.getAll:", error);
            throw error;
        }
    }
    async getAllWithFilter(params = {}) {
        try {
            const ventas = await this.modelVenta.getAllWithFilter(params);
            return ventas;
        }
        catch (error) {
            logger.error("VentaService.getAllWithFilter:", error);
            throw error;
        }
    }
    async getById(id) {
        try {
            const venta = await this.modelVenta.getById({ id });
            return venta;
        }
        catch (error) {
            logger.error("VentaService.getById:", error);
            throw error;
        }
    }
    async getBySDS(sds) {
        try {
            const venta = await this.modelVenta.getBySDS({ sds });
            return venta;
        }
        catch (error) {
            logger.error("VentaService.getBySDS:", error);
            throw error;
        }
    }
    async getBySAP(sap) {
        try {
            const venta = await this.modelVenta.getBySAP({ sap });
            return venta;
        }
        catch (error) {
            logger.error("VentaService.getBySAP:", error);
            throw error;
        }
    }
    async create(input, usuarioId) {
        try {
            const newVenta = await this.modelVenta.add({ input });
            // Crear estado automático según SDS y STL (solo si hay modelo de estado)
            const estadoVentaModel = this.modelEstadoVenta;
            if (estadoVentaModel) {
                const estadoInicial = input.sds
                    ? "CREADO SIN DOCU"
                    : "INICIAL";
                await estadoVentaModel.add({
                    input: {
                        venta_id: newVenta.venta_id,
                        estado: estadoInicial,
                        descripcion: input.sds
                            ? "Venta creada con SDS"
                            : "Venta sin SDS",
                        usuario_id: usuarioId,
                    },
                });
                logger.info(`Estado inicial '${estadoInicial}' creado para venta ${newVenta.venta_id}`);
            }
            return newVenta;
        }
        catch (error) {
            logger.error("VentaService.create:", error);
            throw error;
        }
    }
    async update(id, input) {
        try {
            const updatedVenta = await this.modelVenta.update({ id, input });
            return updatedVenta;
        }
        catch (error) {
            logger.error("VentaService.update:", error);
            throw error;
        }
    }
    async delete(id) {
        try {
            const deleted = await this.modelVenta.delete({ id });
            return deleted;
        }
        catch (error) {
            logger.error("VentaService.delete:", error);
            throw error;
        }
    }
    async getByVendedor(vendedor) {
        try {
            const ventas = await this.modelVenta.getByVendedor({ vendedor });
            return ventas;
        }
        catch (error) {
            logger.error("VentaService.getByVendedor:", error);
            throw error;
        }
    }
    async getByCliente(cliente) {
        try {
            const ventas = await this.modelVenta.getByCliente({ cliente });
            return ventas;
        }
        catch (error) {
            logger.error("VentaService.getByCliente:", error);
            throw error;
        }
    }
    async getByPlan(plan) {
        try {
            const ventas = await this.modelVenta.getByPlan({ plan });
            return ventas;
        }
        catch (error) {
            logger.error("VentaService.getByPlan:", error);
            throw error;
        }
    }
    async getByDateRange(start, end) {
        try {
            const ventas = await this.modelVenta.getByDateRange({ start, end });
            return ventas;
        }
        catch (error) {
            logger.error("VentaService.getByDateRange:", error);
            throw error;
        }
    }
    async getStatistics(pais, vendedorId) {
        try {
            const stats = await this.modelVenta.getStatistics(pais, vendedorId);
            return stats;
        }
        catch (error) {
            logger.error("VentaService.getStatistics:", error);
            throw error;
        }
    }
    validateDates(start, end) {
        const errors = [];
        if (!start || !end) {
            errors.push("Parámetros 'start' y 'end' son requeridos");
            return { isValid: false, errors };
        }
        const startDate = new Date(start);
        const endDate = new Date(end);
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            errors.push("Fechas inválidas");
            return { isValid: false, errors };
        }
        return { isValid: true };
    }
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
    async validatePlan(planId, empresaOrigenId, planService) {
        const errors = [];
        console.log("Validando plan", "Plan:", planId, "Empresa:", empresaOrigenId);
        const plan = await planService.getById(planId.toString());
        console.log("Plan encontrado:", plan);
        console.log("Empresa origen plan:", plan?.empresa_origen_id);
        if (!plan) {
            errors.push(`El plan ${planId} no existe`);
            return { isValid: false, errors };
        }
        if (plan.empresa_origen_id !== empresaOrigenId) {
            errors.push("El plan no corresponde a la empresa origen especificada");
            return { isValid: false, errors };
        }
        return { isValid: true };
    }
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
    async validatePromocion(promocionId, empresaOrigenId, promocionService) {
        const errors = [];
        const promocion = await promocionService.getById(promocionId.toString());
        if (!promocion) {
            errors.push(`La promoción ${promocionId} no existe`);
            return { isValid: false, errors };
        }
        if (promocion.empresa_origen_id !== empresaOrigenId) {
            errors.push("La promoción no corresponde a la empresa origen especificada");
            return { isValid: false, errors };
        }
        return { isValid: true };
    }
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
    assignSap(ventaData, correo) {
        if (correo &&
            ventaData.chip === "SIM" && correo.sap_id) {
            return { ...ventaData, sap: correo.sap_id };
        }
        return ventaData;
    }
    /**
     * Obtiene ventas optimizadas para UI con JOINs completos
     * Incluyen datos del cliente, vendedor, supervisor, plan, promoción y empresa origen
     */
    async getVentasUI(params) {
        try {
            return await this.modelVenta.getVentasUI(params);
        }
        catch (error) {
            logger.error("VentaService.getVentasUI:", error);
            throw error;
        }
    }
    /**
     * Obtiene el detalle completo de una venta
     * Incluye cliente, vendedor, supervisor, plan, promoción, empresa origen,
     * portabilidad/línea nueva, historial de estados, historial de correo,
     * comentarios y datos del correo
     */
    async getVentaDetalleCompleto(ventaId) {
        try {
            return await this.modelVenta.getVentaDetalleCompleto(ventaId);
        }
        catch (error) {
            logger.error("VentaService.getVentaDetalleCompleto:", error);
            throw error;
        }
    }
}
//# sourceMappingURL=VentaService.js.map