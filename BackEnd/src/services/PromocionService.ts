// BackEnd/src/services/PromocionService.ts
// ============================================
import { PromocionModelDB } from "../interface/Promocion.ts";
import {
  PromocionCreate,
  PromocionUpdate,
} from "../schemas/venta/Promocion.ts";

export class PromocionService {
  private modePromocion: PromocionModelDB;

  constructor(modePromocion: PromocionModelDB) {
    this.modePromocion = modePromocion;
  }

  async getAll(params: { page?: number; limit?: number } = {}) {
    try {
      const promociones = await this.modePromocion.getAll(params);
      return promociones;
    } catch (error) {
      console.error("[ERROR] PromocionService.getAll:", error);
      throw error;
    }
  }

  async getById(id: string) {
    try {
      const promocion = await this.modePromocion.getById({ id });
      return promocion;
    } catch (error) {
      console.error("[ERROR] PromocionService.getById:", error);
      throw error;
    }
  }

  async getByEmpresa(empresa: string) {
    try {
      const promociones = await this.modePromocion.getByEmpresa({ empresa });
      return promociones;
    } catch (error) {
      console.error("[ERROR] PromocionService.getByEmpresa:", error);
      throw error;
    }
  }

  async create(input: PromocionCreate) {
    try {
      const newPromocion = await this.modePromocion.add({ input });
      return newPromocion;
    } catch (error) {
      console.error("[ERROR] PromocionService.create:", error);
      throw error;
    }
  }

  async update(id: string, input: PromocionUpdate) {
    try {
      const updatedPromocion = await this.modePromocion.update({ id, input });
      return updatedPromocion;
    } catch (error) {
      console.error("[ERROR] PromocionService.update:", error);
      throw error;
    }
  }

  async delete(id: string) {
    try {
      const deleted = await this.modePromocion.delete({ id });
      return deleted;
    } catch (error) {
      console.error("[ERROR] PromocionService.delete:", error);
      throw error;
    }
  }
}
