// BackEnd/src/Controller/PlanController.ts
// ============================================
import { PlanCreate, PlanUpdate } from "../schemas/venta/Plan.ts";
import { PlanService } from "../services/PlanService.ts";

export class PlanController {
  private planService: PlanService;

  constructor(planService: PlanService) {
    this.planService = planService;
  }

  async getAll(input: { page?: number; limit?: number }) {
    try {
      const plans = await this.planService.getAll(input);
      return plans;
    } catch (error) {
      console.error("[ERROR] PlanController.getAll:", error);
      throw error;
    }
  }

  async getById(input: { id: string }) {
    try {
      const plan = await this.planService.getById(input.id);
      return plan;
    } catch (error) {
      console.error("[ERROR] PlanController.getById:", error);
      throw error;
    }
  }

  async create(input: { plan: PlanCreate }) {
    try {
      const newPlan = await this.planService.create(input.plan);
      return newPlan;
    } catch (error) {
      console.error("[ERROR] PlanController.create:", error);
      throw error;
    }
  }

  async update(input: { id: string; plan: PlanUpdate }) {
    try {
      const updatedPlan = await this.planService.update(input.id, input.plan);
      return updatedPlan;
    } catch (error) {
      console.error("[ERROR] PlanController.update:", error);
      throw error;
    }
  }

  async delete(input: { id: string }) {
    try {
      const deleted = await this.planService.delete(input.id);
      return deleted;
    } catch (error) {
      console.error("[ERROR] PlanController.delete:", error);
      throw error;
    }
  }
}