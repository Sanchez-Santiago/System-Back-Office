// BackEnd/src/Controller/PromocionController.ts
// ============================================
import { logger } from "../Utils/logger";
export class PromocionController {
    promocionService;
    constructor(promocionService) {
        this.promocionService = promocionService;
    }
    async getAll(input) {
        try {
            const promociones = await this.promocionService.getAll(input);
            return promociones;
        }
        catch (error) {
            logger.error("PromocionController.getAll:", error);
            throw error;
        }
    }
    async getById(input) {
        try {
            const promocion = await this.promocionService.getById(input.id);
            return promocion;
        }
        catch (error) {
            logger.error("PromocionController.getById:", error);
            throw error;
        }
    }
    async getByEmpresa(input) {
        try {
            const promociones = await this.promocionService.getByEmpresa(input.empresa);
            return promociones;
        }
        catch (error) {
            logger.error("PromocionController.getByEmpresa:", error);
            throw error;
        }
    }
    async create(input) {
        try {
            const newPromocion = await this.promocionService.create(input.promocion);
            return newPromocion;
        }
        catch (error) {
            logger.error("PromocionController.create:", error);
            throw error;
        }
    }
    async update(input) {
        try {
            const updatedPromocion = await this.promocionService.update(input.id, input.promocion);
            return updatedPromocion;
        }
        catch (error) {
            logger.error("PromocionController.update:", error);
            throw error;
        }
    }
    async delete(input) {
        try {
            const deleted = await this.promocionService.delete(input.id);
            return deleted;
        }
        catch (error) {
            logger.error("PromocionController.delete:", error);
            throw error;
        }
    }
}
//# sourceMappingURL=PromocionController.js.map