// ============================================
// BackEnd/src/Controller/EstadisticaController.ts
// Controlador de estadísticas
// ============================================
import { logger } from "../Utils/logger.ts";
function convertBigIntToString(obj) {
    if (typeof obj === "bigint") {
        return obj.toString();
    }
    if (obj !== null && typeof obj === "object") {
        if (typeof obj.toISOString === "function") {
            return obj.toISOString();
        }
        if (Array.isArray(obj)) {
            return obj.map(convertBigIntToString);
        }
        const converted = {};
        for (const key in obj) {
            converted[key] = convertBigIntToString(obj[key]);
        }
        return converted;
    }
    return obj;
}
export class EstadisticaController {
    service;
    constructor(service) {
        this.service = service;
    }
    async getEstadisticas(filters) {
        try {
            logger.info("Consultando estadísticas con filtros:", filters);
            const estadisticas = await this.service.getEstadisticas(filters);
            return convertBigIntToString(estadisticas);
        }
        catch (error) {
            logger.error("Error en EstadisticaController.getEstadisticas:", error);
            throw error;
        }
    }
    async getRecargas(filters) {
        try {
            logger.info("Consultando recargas con filtros:", filters);
            const recargas = await this.service.getRecargas(filters);
            return convertBigIntToString(recargas);
        }
        catch (error) {
            logger.error("Error en EstadisticaController.getRecargas:", error);
            throw error;
        }
    }
}
//# sourceMappingURL=EstadisticaController.js.map