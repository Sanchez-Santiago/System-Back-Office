import { logger } from '../Utils/logger';
export class PortabilidadService {
    model;
    constructor(model) {
        this.model = model;
    }
    async getAll(params = {}) {
        const result = await this.model.getAll(params);
        return result || [];
    }
    async getById({ id }) {
        return this.model.getById({ id });
    }
    async create({ portabilidad }) {
        return this.model.add({ input: portabilidad });
    }
    async update({ id, portabilidad }) {
        return this.model.update({ id, input: portabilidad });
    }
    async delete({ id }) {
        return this.model.delete({ id });
    }
    async getByVenta({ venta }) {
        return this.model.getByVenta({ venta });
    }
    async getStatistics() {
        try {
            const stats = await this.model.getStatistics();
            return stats;
        }
        catch (error) {
            logger.error("PortabilidadService.getStatistics:", error);
            throw error;
        }
    }
}
//# sourceMappingURL=PortabilidadService.js.map