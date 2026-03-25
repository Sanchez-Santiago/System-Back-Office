// ============================================
// BackEnd/src/services/EstadisticaService.ts
// Servicio de estadísticas
// ============================================
import { logger } from "../Utils/logger";
export class EstadisticaService {
    model;
    constructor(model) {
        this.model = model;
    }
    async getEstadisticas(filters) {
        try {
            logger.info("Obteniendo estadísticas con filtros:", filters);
            const result = await this.model.getEstadisticas(filters);
            logger.info("Estadísticas obtenidas exitosamente");
            return result;
        }
        catch (error) {
            logger.error("Error en EstadisticaService.getEstadisticas:", error);
            throw error;
        }
    }
    async getRecargas(filters) {
        try {
            logger.info("Obteniendo recargas detalladas con filtros:", filters);
            const result = await this.model.getRecargasDetalladas(filters);
            logger.info("Recargas detalladas obtenidas:", result.totalRecargas);
            return result;
        }
        catch (error) {
            logger.error("Error en EstadisticaService.getRecargas:", error);
            throw error;
        }
    }
}
//# sourceMappingURL=EstadisticaService.js.map