import { logger } from '../Utils/logger.ts';
export class LineaNuevaService {
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
    async create({ lineaNueva }) {
        return this.model.add({ input: lineaNueva });
    }
    async update({ id, lineaNueva }) {
        return this.model.update({ id, input: lineaNueva });
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
            logger.error("LineaNuevaService.getStatistics:", error);
            throw error;
        }
    }
    async getByEstado({ estado }) {
        return this.model.getByEstado({ estado });
    }
}
//# sourceMappingURL=LineaNuevaService.js.map