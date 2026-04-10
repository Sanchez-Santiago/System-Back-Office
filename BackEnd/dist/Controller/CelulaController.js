// BackEnd/src/Controller/CelulaController.ts
// ============================================
import { logger } from "../Utils/logger";
export class CelulaController {
    celulaService;
    constructor(celulaService) {
        this.celulaService = celulaService;
    }
    async getAll(input) {
        try {
            const celulas = await this.celulaService.getAll(input);
            return celulas;
        }
        catch (error) {
            logger.error("CelulaController.getAll:", error);
            throw error;
        }
    }
    async getById(input) {
        try {
            const celula = await this.celulaService.getById(input.id);
            return celula;
        }
        catch (error) {
            logger.error("CelulaController.getById:", error);
            throw error;
        }
    }
    async getByEmpresa(input) {
        try {
            const celulas = await this.celulaService.getByEmpresa(input.empresa);
            return celulas;
        }
        catch (error) {
            logger.error("CelulaController.getByEmpresa:", error);
            throw error;
        }
    }
    async getAsesoresByCelula(input) {
        try {
            const asesores = await this.celulaService.getAsesoresByCelula(input.id_celula);
            return asesores;
        }
        catch (error) {
            logger.error("CelulaController.getAsesoresByCelula:", error);
            throw error;
        }
    }
    async create(input) {
        try {
            const newCelula = await this.celulaService.create(input.celula);
            return newCelula;
        }
        catch (error) {
            logger.error("CelulaController.create:", error);
            throw error;
        }
    }
    async update(input) {
        try {
            const updatedCelula = await this.celulaService.update(input.id, input.celula);
            return updatedCelula;
        }
        catch (error) {
            logger.error("CelulaController.update:", error);
            throw error;
        }
    }
    async delete(input) {
        try {
            const deleted = await this.celulaService.delete(input.id);
            return deleted;
        }
        catch (error) {
            logger.error("CelulaController.delete:", error);
            throw error;
        }
    }
}
//# sourceMappingURL=CelulaController.js.map