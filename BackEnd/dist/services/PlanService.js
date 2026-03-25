import { logger } from "../Utils/logger";
export class PlanService {
    modePlan;
    constructor(modePlan) {
        this.modePlan = modePlan;
    }
    async getAll(params = {}) {
        try {
            if (params.pais) {
                const plans = await this.modePlan.getAllWithFilter(params);
                return plans;
            }
            const plans = await this.modePlan.getAll(params);
            return plans;
        }
        catch (error) {
            logger.error("PlanService.getAll:", error);
            throw error;
        }
    }
    async getById(id) {
        try {
            const plan = await this.modePlan.getById({ id });
            return plan;
        }
        catch (error) {
            logger.error("PlanService.getById:", error);
            throw error;
        }
    }
    async create(input) {
        try {
            const newPlan = await this.modePlan.add({ input });
            return newPlan;
        }
        catch (error) {
            logger.error("PlanService.create:", error);
            throw error;
        }
    }
    async update(id, input) {
        try {
            const updatedPlan = await this.modePlan.update({ id, input });
            return updatedPlan;
        }
        catch (error) {
            logger.error("PlanService.update:", error);
            throw error;
        }
    }
    async delete(id) {
        try {
            const deleted = await this.modePlan.delete({ id });
            return deleted;
        }
        catch (error) {
            logger.error("PlanService.delete:", error);
            throw error;
        }
    }
    async getByEmpresa(params) {
        try {
            const plans = await this.modePlan.getByEmpresa(params);
            return plans;
        }
        catch (error) {
            logger.error("PlanService.getByEmpresa:", error);
            throw error;
        }
    }
}
//# sourceMappingURL=PlanService.js.map