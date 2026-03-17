import { manejoDeError } from "../Utils/errores.ts";
export class EmpresaController {
    empresaService;
    constructor(empresaService) {
        this.empresaService = empresaService;
    }
    async getAll(params) {
        try {
            const empresas = await this.empresaService.getAll(params);
            return empresas;
        }
        catch (error) {
            manejoDeError("Error obteniendo empresas", error);
            throw error;
        }
    }
    async getById(id) {
        try {
            const empresa = await this.empresaService.getById(id);
            return empresa;
        }
        catch (error) {
            manejoDeError("Error obteniendo empresa", error);
            throw error;
        }
    }
    async create(input) {
        try {
            const empresa = await this.empresaService.create(input);
            return empresa;
        }
        catch (error) {
            manejoDeError("Error creando empresa", error);
            throw error;
        }
    }
    async update(id, input) {
        try {
            const empresa = await this.empresaService.update(id, input);
            return empresa;
        }
        catch (error) {
            manejoDeError("Error actualizando empresa", error);
            throw error;
        }
    }
    async delete(id) {
        try {
            const success = await this.empresaService.delete(id);
            return success;
        }
        catch (error) {
            manejoDeError("Error eliminando empresa", error);
            throw error;
        }
    }
}
//# sourceMappingURL=EmpresaController.js.map