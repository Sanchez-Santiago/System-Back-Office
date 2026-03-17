// BackEnd/src/Controller/PlanController.ts
// ============================================
import { logger } from "../Utils/logger.ts";
export class PlanController {
    planService;
    constructor(planService) {
        this.planService = planService;
    }
    async getAll(input) {
        try {
            const plans = await this.planService.getAll(input);
            return plans;
        }
        catch (error) {
            logger.error("PlanController.getAll:", error);
            throw error;
        }
    }
    async getById(input) {
        try {
            const plan = await this.planService.getById(input.id);
            return plan;
        }
        catch (error) {
            logger.error("PlanController.getById:", error);
            throw error;
        }
    }
    async create(input) {
        try {
            const newPlan = await this.planService.create(input.plan);
            return newPlan;
        }
        catch (error) {
            logger.error("PlanController.create:", error);
            throw error;
        }
    }
    async update(input) {
        try {
            const updatedPlan = await this.planService.update(input.id, input.plan);
            return updatedPlan;
        }
        catch (error) {
            logger.error("PlanController.update:", error);
            throw error;
        }
    }
    async delete(input) {
        try {
            const deleted = await this.planService.delete(input.id);
            return deleted;
        }
        catch (error) {
            logger.error("PlanController.delete:", error);
            throw error;
        }
    }
    async getByEmpresa(input) {
        try {
            const plans = await this.planService.getByEmpresa({ empresa: Number(input.empresa) });
            return plans;
        }
        catch (error) {
            logger.error("PlanController.getByEmpresa:", error);
            throw error;
        }
    }
}
//# sourceMappingURL=PlanController.js.map