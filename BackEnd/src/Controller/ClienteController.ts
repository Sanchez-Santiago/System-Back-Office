// BackEnd/src/Controller/ClienteController.ts
// ============================================
import { ClienteCreate, ClienteUpdate } from "../schemas/persona/Cliente.ts";
import { ClienteService } from "../services/ClienteService.ts";

export class ClienteController {
  private clienteService: ClienteService;

  constructor(clienteService: ClienteService) {
    this.clienteService = clienteService;
  }

  async getAll(params: { page?: number; limit?: number }) {
    try {
      const clientes = await this.clienteService.getAll(params);
      return clientes;
    } catch (error) {
      console.error("[ERROR] ClienteController.getAll:", error);
      throw error;
    }
  }

  async getById(input: { id: string }) {
    try {
      const cliente = await this.clienteService.getById(input.id);
      return cliente;
    } catch (error) {
      console.error("[ERROR] ClienteController.getById:", error);
      throw error;
    }
  }

  async getWithPersonaData(input: { personaId: string }) {
    try {
      const cliente = await this.clienteService.getWithPersonaData(input.personaId);
      return cliente;
    } catch (error) {
      console.error("[ERROR] ClienteController.getWithPersonaData:", error);
      throw error;
    }
  }

  async getAllWithPersonaData(params: { page?: number; limit?: number }) {
    try {
      const clientes = await this.clienteService.getAllWithPersonaData(params);
      return clientes;
    } catch (error) {
      console.error("[ERROR] ClienteController.getAllWithPersonaData:", error);
      throw error;
    }
  }

  async create(input: { cliente: ClienteCreate }) {
    try {
      const newCliente = await this.clienteService.create(input.cliente);
      return newCliente;
    } catch (error) {
      console.error("[ERROR] ClienteController.create:", error);
      throw error;
    }
  }

  async update(input: { id: string; cliente: ClienteUpdate }) {
    try {
      const updatedCliente = await this.clienteService.update(input.id, input.cliente);
      return updatedCliente;
    } catch (error) {
      console.error("[ERROR] ClienteController.update:", error);
      throw error;
    }
  }

  async delete(input: { id: string }) {
    try {
      const deleted = await this.clienteService.delete(input.id);
      return deleted;
    } catch (error) {
      console.error("[ERROR] ClienteController.delete:", error);
      throw error;
    }
  }
}