// BackEnd/src/services/PlanService.ts
// ============================================
import { PlanModelDB } from "../interface/Plan.ts";
import { PlanCreate, PlanUpdate } from "../schemas/venta/Plan.ts";

export class PlanService {
  private modePlan: PlanModelDB;

  constructor(modePlan: PlanModelDB) {
    this.modePlan = modePlan;
  }

  async getAll(params: { page?: number; limit?: number } = {}) {
    try {
      const plans = await this.modePlan.getAll(params);
      return plans;
    } catch (error) {
      console.error("[ERROR] PlanService.getAll:", error);
      throw error;
    }
  }

  async getById(id: string) {
    try {
      const plan = await this.modePlan.getById({ id });
      return plan;
    } catch (error) {
      console.error("[ERROR] PlanService.getById:", error);
      throw error;
    }
  }

  async create(input: PlanCreate) {
    try {
      const newPlan = await this.modePlan.add({ input });
      return newPlan;
    } catch (error) {
      console.error("[ERROR] PlanService.create:", error);
      throw error;
    }
  }

  async update(id: string, input: PlanUpdate) {
    try {
      const updatedPlan = await this.modePlan.update({ id, input });
      return updatedPlan;
    } catch (error) {
      console.error("[ERROR] PlanService.update:", error);
      throw error;
    }
  }

  async delete(id: string) {
    try {
      const deleted = await this.modePlan.delete({ id });
      return deleted;
    } catch (error) {
      console.error("[ERROR] PlanService.delete:", error);
      throw error;
    }
  }
}