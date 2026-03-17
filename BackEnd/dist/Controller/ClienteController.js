// BackEnd/src/Controller/ClienteController.ts
// ============================================
import { logger } from "../Utils/logger.ts";
export class ClienteController {
    clienteService;
    constructor(clienteService) {
        this.clienteService = clienteService;
    }
    async getAll(params) {
        try {
            const clientes = await this.clienteService.getAll(params);
            return clientes;
        }
        catch (error) {
            logger.error("ClienteController.getAll:", error);
            throw error;
        }
    }
    async getById(input) {
        try {
            const cliente = await this.clienteService.getById(input.id);
            return cliente;
        }
        catch (error) {
            logger.error("ClienteController.getById:", error);
            throw error;
        }
    }
    async getWithPersonaData(input) {
        try {
            const cliente = await this.clienteService.getWithPersonaData(input.personaId);
            return cliente;
        }
        catch (error) {
            logger.error("ClienteController.getWithPersonaData:", error);
            throw error;
        }
    }
    async getAllWithPersonaData(params) {
        try {
            const clientes = await this.clienteService.getAllWithPersonaData(params);
            return clientes;
        }
        catch (error) {
            logger.error("ClienteController.getAllWithPersonaData:", error);
            throw error;
        }
    }
    async getByDocumento(input) {
        try {
            const cliente = await this.clienteService.getByDocumento(input.tipo_documento, input.documento);
            return cliente;
        }
        catch (error) {
            logger.error("ClienteController.getByDocumento:", error);
            throw error;
        }
    }
    async create(input) {
        try {
            const newCliente = await this.clienteService.create(input.cliente);
            return newCliente;
        }
        catch (error) {
            logger.error("ClienteController.create:", error);
            throw error;
        }
    }
    async update(input) {
        try {
            const updatedCliente = await this.clienteService.update(input.id, input.cliente);
            return updatedCliente;
        }
        catch (error) {
            logger.error("ClienteController.update:", error);
            throw error;
        }
    }
    async delete(input) {
        try {
            const deleted = await this.clienteService.delete(input.id);
            return deleted;
        }
        catch (error) {
            logger.error("ClienteController.delete:", error);
            throw error;
        }
    }
}
//# sourceMappingURL=ClienteController.js.map