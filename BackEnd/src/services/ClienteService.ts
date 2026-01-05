// BackEnd/src/services/ClienteService.ts
// ============================================
import { ClienteModelDB } from "../interface/Cliente.ts";
import { ClienteUpdate } from "../schemas/persona/Cliente.ts";
import { ClienteCreate } from "../schemas/persona/Cliente.ts";

export class ClienteService {
  private modeCliente: ClienteModelDB;

  constructor(modeCliente: ClienteModelDB) {
    this.modeCliente = modeCliente;
  }

  async getAll(params: { page?: number; limit?: number } = {}) {
    try {
      const clientes = await this.modeCliente.getAll(params);
      return clientes;
    } catch (error) {
      console.error("[ERROR] ClienteService.getAll:", error);
      throw error;
    }
  }

  async getById(id: string) {
    try {
      const cliente = await this.modeCliente.getById({ id });
      return cliente;
    } catch (error) {
      console.error("[ERROR] ClienteService.getById:", error);
      throw error;
    }
  }

  async getWithPersonaData(personaId: string) {
    try {
      const cliente = await this.modeCliente.getWithPersonaData({ personaId });
      return cliente;
    } catch (error) {
      console.error("[ERROR] ClienteService.getWithPersonaData:", error);
      throw error;
    }
  }

  async getAllWithPersonaData(params: { page?: number; limit?: number } = {}) {
    try {
      const clientes = await this.modeCliente.getAllWithPersonaData(params);
      return clientes;
    } catch (error) {
      console.error("[ERROR] ClienteService.getAllWithPersonaData:", error);
      throw error;
    }
  }

  async create(input: ClienteCreate) {
    try {
      const newCliente = await this.modeCliente.add({ input });
      return newCliente;
    } catch (error) {
      console.error("[ERROR] ClienteService.create:", error);
      throw error;
    }
  }

  async update(id: string, input: ClienteUpdate) {
    try {
      const updatedCliente = await this.modeCliente.update({ id, input });
      return updatedCliente;
    } catch (error) {
      console.error("[ERROR] ClienteService.update:", error);
      throw error;
    }
  }

  async delete(id: string) {
    try {
      const deleted = await this.modeCliente.delete({ id });
      return deleted;
    } catch (error) {
      console.error("[ERROR] ClienteService.delete:", error);
      throw error;
    }
  }
}