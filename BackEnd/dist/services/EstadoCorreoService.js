import { EstadoCorreoCreateSchema, } from "../schemas/correo/EstadoCorreo";
import { logger } from "../Utils/logger";
/**
 * Servicio de Estado de Correo
 * Gestiona la lógica de negocio para el tracking de correos
 */
export class EstadoCorreoService {
    model;
    constructor(model) {
        this.model = model;
    }
    /**
     * Obtiene todos los estados con paginación
     */
    async getAll(params) {
        try {
            const page = params.page || 1;
            const limit = params.limit || 10;
            if (page < 1 || limit < 1) {
                throw new Error("Los valores de paginación deben ser mayores a 0");
            }
            if (limit > 100) {
                throw new Error("El límite máximo es 100 estados por página");
            }
            logger.info(`Obteniendo estados - Página: ${page}, Límite: ${limit}`);
            const estados = await this.model.getAll();
            if (!estados || estados.length === 0) {
                return undefined;
            }
            console.log(`[INFO] ${estados.length} estados encontrados`);
            return estados;
        }
        catch (error) {
            logger.error("EstadoCorreoService.getAll:", error);
            throw new Error(`Error al obtener estados: ${error instanceof Error ? error.message : "Error desconocido"}`);
        }
    }
    /**
     * Obtiene un estado por ID
     */
    async getById({ id }) {
        try {
            if (!id || id <= 0) {
                throw new Error("ID de estado requerido");
            }
            logger.info(`Buscando estado por ID: ${id}`);
            const estado = await this.model.getById({ id });
            if (!estado) {
                return undefined;
            }
            logger.info(`Estado encontrado: ${estado.estado_correo_id}`);
            return estado;
        }
        catch (error) {
            logger.error("EstadoCorreoService.getById:", error);
            throw new Error(`Error al obtener estado por ID: ${error instanceof Error ? error.message : "Error desconocido"}`);
        }
    }
    /**
     * Obtiene TODO el historial de estados de un correo por SAP
     */
    async getBySAP({ sap }) {
        try {
            if (!sap || sap.trim() === "") {
                throw new Error("Código SAP requerido");
            }
            logger.info(`Buscando historial completo por SAP: ${sap}`);
            const estados = await this.model.getBySAP({ sap });
            if (!estados || estados.length === 0) {
                logger.warn(`No se encontraron estados para SAP: ${sap}`);
                return [];
            }
            logger.info(`${estados.length} estados encontrados para SAP: ${sap}`);
            return estados;
        }
        catch (error) {
            logger.error("EstadoCorreoService.getBySAP:", error);
            throw new Error(`Error al obtener historial por SAP: ${error instanceof Error ? error.message : "Error desconocido"}`);
        }
    }
    async getLastBySAP({ sap }) {
        const estado = await this.model.getLastBySAP({ sap });
        if (!estado) {
            logger.warn(`No se encontraron estados para SAP: ${sap}`);
            return undefined;
        }
        logger.info(`Estado encontrado para SAP: ${sap}`);
        return estado;
    }
    /**
     * Crea un nuevo estado de correo
     */
    async create(input) {
        try {
            if (!input || Object.keys(input).length === 0) {
                throw new Error("Datos de estado requeridos");
            }
            logger.info(`Creando estado para SAP: ${input.sap_id}`);
            // Validar con Zod
            const validated = EstadoCorreoCreateSchema.parse(input);
            // Normalizar datos - el estado ya viene validado por Zod
            const normalizedInput = {
                ...validated,
                ubicacion_actual: validated.ubicacion_actual?.toUpperCase() || null,
            };
            const estado = await this.model.add({ input: normalizedInput });
            if (!estado) {
                throw new Error("Error al crear el estado");
            }
            logger.info(`Estado creado exitosamente: ${estado.estado_correo_id}`);
            return estado;
        }
        catch (error) {
            logger.error("EstadoCorreoService.create:", error);
            throw new Error(`Error al crear estado: ${error instanceof Error ? error.message : "Error desconocido"}`);
        }
    }
    /**
     * Actualiza un estado existente
     */
    async update(params) {
        try {
            if (!params.id || params.id <= 0) {
                throw new Error("ID de estado requerido");
            }
            if (!params.input || Object.keys(params.input).length === 0) {
                throw new Error("No hay datos para actualizar");
            }
            logger.info(`Actualizando estado: ${params.id}`);
            // Verificar existencia
            const existingEstado = await this.model.getById({ id: params.id });
            if (!existingEstado) {
                throw new Error(`Estado con ID ${params.id} no encontrado`);
            }
            // Normalizar datos
            const normalizedInput = { ...params.input };
            if (normalizedInput.estado) {
                normalizedInput.estado = normalizedInput.estado
                    .toUpperCase();
            }
            if (normalizedInput.ubicacion_actual) {
                normalizedInput.ubicacion_actual = normalizedInput.ubicacion_actual
                    .toUpperCase();
            }
            const estadoActualizado = await this.model.update({
                id: params.id,
                input: normalizedInput,
            });
            if (!estadoActualizado) {
                throw new Error("Error al actualizar estado");
            }
            logger.info(`Estado actualizado exitosamente: ${estadoActualizado.estado_correo_id}`);
            return estadoActualizado;
        }
        catch (error) {
            logger.error("EstadoCorreoService.update:", error);
            throw new Error(`Error al actualizar estado: ${error instanceof Error ? error.message : "Error desconocido"}`);
        }
    }
    /**
     * Elimina un estado
     */
    async delete(params) {
        try {
            if (!params.id || params.id <= 0) {
                throw new Error("ID de estado requerido");
            }
            logger.info(`Eliminando estado: ${params.id}`);
            const existingEstado = await this.model.getById({ id: params.id });
            if (!existingEstado) {
                throw new Error(`Estado con ID ${params.id} no encontrado`);
            }
            const deleted = await this.model.delete({ id: params.id });
            if (!deleted) {
                throw new Error("Error al eliminar estado");
            }
            logger.info(`Estado ${params.id} eliminado exitosamente`);
        }
        catch (error) {
            logger.error("EstadoCorreoService.delete:", error);
            throw new Error(`Error al eliminar estado: ${error instanceof Error ? error.message : "Error desconocido"}`);
        }
    }
    /**
     * Obtiene correos entregados (estado = 'ENTREGADO')
     */
    async getEntregados() {
        try {
            logger.info("Obteniendo correos entregados");
            const estados = await this.model.getEntregados();
            logger.info(`${estados.length} correos entregados encontrados`);
            return estados;
        }
        catch (error) {
            logger.error("EstadoCorreoService.getEntregados:", error);
            throw new Error(`Error al obtener correos entregados: ${error instanceof Error ? error.message : "Error desconocido"}`);
        }
    }
    /**
     * Obtiene correos no entregados (estado = 'NO ENTREGADO')
     */
    async getNoEntregados() {
        try {
            logger.info("Obteniendo correos no entregados");
            const estados = await this.model.getNoEntregados();
            logger.info(`${estados.length} correos no entregados encontrados`);
            return estados;
        }
        catch (error) {
            logger.error("EstadoCorreoService.getNoEntregados:", error);
            throw new Error(`Error al obtener correos no entregados: ${error instanceof Error ? error.message : "Error desconocido"}`);
        }
    }
    /**
     * Obtiene correos devueltos (estado = 'DEVUELTO AL CLIENTE')
     */
    async getDevueltos() {
        try {
            logger.info("Obteniendo correos devueltos");
            const estados = await this.model.getDevueltos();
            logger.info(`${estados.length} correos devueltos encontrados`);
            return estados;
        }
        catch (error) {
            logger.error("EstadoCorreoService.getDevueltos:", error);
            throw new Error(`Error al obtener correos devueltos: ${error instanceof Error ? error.message : "Error desconocido"}`);
        }
    }
    /**
     * Obtiene correos en tránsito (estado = 'EN TRANSITO')
     */
    async getEnTransito() {
        try {
            logger.info("Obteniendo correos en tránsito");
            const estados = await this.model.getEnTransito();
            logger.info(`${estados.length} correos en tránsito encontrados`);
            return estados;
        }
        catch (error) {
            logger.error("EstadoCorreoService.getEnTransito:", error);
            throw new Error(`Error al obtener correos en tránsito: ${error instanceof Error ? error.message : "Error desconocido"}`);
        }
    }
    /**
     * Obtiene correos asignados (estado = 'ASIGNADO')
     */
    async getAsignados() {
        try {
            logger.info("Obteniendo correos asignados");
            const estados = await this.model.getAsignados();
            logger.info(`${estados.length} correos asignados encontrados`);
            return estados;
        }
        catch (error) {
            logger.error("EstadoCorreoService.getAsignados:", error);
            throw new Error(`Error al obtener correos asignados: ${error instanceof Error ? error.message : "Error desconocido"}`);
        }
    }
    /**
     * Obtiene correos por estado específico
     */
    async getByEstado({ estado }) {
        try {
            if (!estado || estado.trim() === "") {
                throw new Error("Estado requerido");
            }
            logger.info(`Obteniendo correos con estado: ${estado}`);
            const estados = await this.model.getByEstado({ estado });
            logger.info(`${estados.length} correos encontrados con estado: ${estado}`);
            return estados;
        }
        catch (error) {
            logger.error("EstadoCorreoService.getByEstado:", error);
            throw new Error(`Error al obtener correos por estado: ${error instanceof Error ? error.message : "Error desconocido"}`);
        }
    }
    /**
     * Marca un correo como entregado
     */
    async marcarComoEntregado({ id }) {
        try {
            if (!id || id <= 0) {
                throw new Error("ID de estado requerido");
            }
            logger.info(`Marcando correo como entregado: ${id}`);
            const estado = await this.model.marcarComoEntregado({ id });
            if (!estado) {
                throw new Error("Error al marcar correo como entregado");
            }
            logger.info(`Correo marcado como entregado: ${id}`);
            return estado;
        }
        catch (error) {
            logger.error("EstadoCorreoService.marcarComoEntregado:", error);
            throw new Error(`Error al marcar como entregado: ${error instanceof Error ? error.message : "Error desconocido"}`);
        }
    }
    /**
     * Actualiza la ubicación actual de un correo
     */
    async actualizarUbicacion(params) {
        try {
            if (!params.id || params.id <= 0) {
                throw new Error("ID de estado requerido");
            }
            if (!params.ubicacion || params.ubicacion.trim() === "") {
                throw new Error("Ubicación requerida");
            }
            logger.info(`Actualizando ubicación: ${params.id}`);
            const estado = await this.model.actualizarUbicacion({
                id: params.id,
                ubicacion: params.ubicacion.toUpperCase(),
            });
            if (!estado) {
                throw new Error("Error al actualizar ubicación");
            }
            logger.info(`Ubicación actualizada: ${params.ubicacion}`);
            return estado;
        }
        catch (error) {
            logger.error("EstadoCorreoService.actualizarUbicacion:", error);
            throw new Error(`Error al actualizar ubicación: ${error instanceof Error ? error.message : "Error desconocido"}`);
        }
    }
    /**
     * Obtiene estadísticas de estados
     */
    async getStats() {
        try {
            logger.info("Obteniendo estadísticas de estados");
            const [entregados, noEntregados, devueltos, enTransito, asignados] = await Promise.all([
                this.model.getEntregados(),
                this.model.getNoEntregados(),
                this.model.getDevueltos(),
                this.model.getEnTransito(),
                this.model.getAsignados(),
            ]);
            const total = entregados.length + noEntregados.length + devueltos.length +
                enTransito.length + asignados.length;
            const porcentajeEntrega = total > 0
                ? Math.round((entregados.length / total) * 100)
                : 0;
            const stats = {
                total,
                entregados: entregados.length,
                noEntregados: noEntregados.length,
                devueltos: devueltos.length,
                enTransito: enTransito.length,
                asignados: asignados.length,
                porcentajeEntrega,
            };
            logger.info(`Estadísticas: ${stats.total} estados totales`);
            return stats;
        }
        catch (error) {
            logger.error("EstadoCorreoService.getStats:", error);
            throw new Error(`Error al obtener estadísticas: ${error instanceof Error ? error.message : "Error desconocido"}`);
        }
    }
    /**
     * Obtiene estados por rango de fechas
     */
    async getByFechaRango(params) {
        try {
            if (!params.fechaInicio || !params.fechaFin) {
                throw new Error("Fechas de inicio y fin requeridas");
            }
            if (params.fechaInicio > params.fechaFin) {
                throw new Error("La fecha de inicio debe ser menor a la fecha fin");
            }
            logger.info(`Obteniendo estados por rango: ${params.fechaInicio} - ${params.fechaFin}`);
            const estados = await this.model.getByFechaRango(params);
            logger.info(`${estados.length} estados encontrados en el rango`);
            return estados;
        }
        catch (error) {
            logger.error("EstadoCorreoService.getByFechaRango:", error);
            throw new Error(`Error al obtener estados por fecha: ${error instanceof Error ? error.message : "Error desconocido"}`);
        }
    }
    /**
     * Obtiene estados por ubicación
     */
    async getByUbicacion({ ubicacion }) {
        try {
            if (!ubicacion || ubicacion.trim() === "") {
                throw new Error("Ubicación requerida");
            }
            logger.info(`Obteniendo estados por ubicación: ${ubicacion}`);
            const estados = await this.model.getByUbicacion({ ubicacion });
            logger.info(`${estados.length} estados encontrados`);
            return estados;
        }
        catch (error) {
            logger.error("EstadoCorreoService.getByUbicacion:", error);
            throw new Error(`Error al obtener estados por ubicación: ${error instanceof Error ? error.message : "Error desconocido"}`);
        }
    }
    /**
     * Crear múltiples estados de correo (bulk)
     */
    async bulkCreate(estados) {
        try {
            if (!estados || !Array.isArray(estados) || estados.length === 0) {
                throw new Error("Se requiere un array de estados");
            }
            logger.info(`Creando ${estados.length} estados de correo en bulk`);
            // Validar cada estado con Zod
            const estadosValidados = estados.map((estado) => {
                return EstadoCorreoCreateSchema.parse(estado);
            });
            // Normalizar datos
            const estadosNormalizados = estadosValidados.map((estado) => ({
                ...estado,
                sap_id: estado.sap_id?.toUpperCase(),
                ubicacion_actual: estado.ubicacion_actual?.toUpperCase() || null,
            }));
            const resultados = await this.model.bulkCreateEstados(estadosNormalizados);
            logger.info(`${resultados.length} estados de correo creados exitosamente`);
            return resultados;
        }
        catch (error) {
            logger.error("EstadoCorreoService.bulkCreate:", error);
            throw new Error(`Error al crear estados masivamente: ${error instanceof Error ? error.message : "Error desconocido"}`);
        }
    }
}
//# sourceMappingURL=EstadoCorreoService.js.map