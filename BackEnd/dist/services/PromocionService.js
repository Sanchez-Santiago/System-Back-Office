import { logger } from '../Utils/logger';
export class PromocionService {
    modePromocion;
    constructor(modePromocion) {
        this.modePromocion = modePromocion;
    }
    async getAll(params = {}) {
        try {
            if (params.pais) {
                const promociones = await this.modePromocion.getAllWithFilter(params);
                return promociones;
            }
            const promociones = await this.modePromocion.getAll(params);
            return promociones;
        }
        catch (error) {
            logger.error("PromocionService.getAll:", error);
            throw error;
        }
    }
    async getById(id) {
        try {
            const promocion = await this.modePromocion.getById({ id });
            return promocion;
        }
        catch (error) {
            logger.error("PromocionService.getById:", error);
            throw error;
        }
    }
    async getByEmpresa(empresa) {
        try {
            const promociones = await this.modePromocion.getByEmpresa({ empresa });
            return promociones;
        }
        catch (error) {
            logger.error("PromocionService.getByEmpresa:", error);
            throw error;
        }
    }
    async create(input) {
        try {
            const newPromocion = await this.modePromocion.add({ input });
            return newPromocion;
        }
        catch (error) {
            logger.error("PromocionService.create:", error);
            throw error;
        }
    }
    async update(id, input) {
        try {
            const updatedPromocion = await this.modePromocion.update({ id, input });
            return updatedPromocion;
        }
        catch (error) {
            logger.error("PromocionService.update:", error);
            throw error;
        }
    }
    async delete(id) {
        try {
            const deleted = await this.modePromocion.delete({ id });
            return deleted;
        }
        catch (error) {
            logger.error("PromocionService.delete:", error);
            throw error;
        }
    }
}
//# sourceMappingURL=PromocionService.js.map