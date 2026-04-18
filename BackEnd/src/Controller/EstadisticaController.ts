// ============================================
// BackEnd/src/Controller/EstadisticaController.ts
// Controlador de estadísticas
// ============================================

import { EstadisticaService } from "../services/EstadisticaService";
import { EstadisticaFilters } from "../interface/Estadistica";
import { logger } from "../Utils/logger";
import { convertBigIntToString } from "../Utils/transformData";

export class EstadisticaController {
  private service: EstadisticaService;

  constructor(service: EstadisticaService) {
    this.service = service;
  }

  async getEstadisticas(filters: EstadisticaFilters) {
    try {
      logger.info("Consultando estadísticas con filtros:", filters);

      const estadisticas = await this.service.getEstadisticas(filters);

      return convertBigIntToString(estadisticas);
    } catch (error) {
      logger.error("Error en EstadisticaController.getEstadisticas:", error);
      throw error;
    }
  }

  async getRecargas(filters: EstadisticaFilters) {
    try {
      logger.info("Consultando recargas con filtros:", filters);

      const recargas = await this.service.getRecargas(filters);

      return convertBigIntToString(recargas);
    } catch (error) {
      logger.error("Error en EstadisticaController.getRecargas:", error);
      throw error;
    }
  }
}
