import { manejoDeError } from "../Utils/errores.ts";
export class EmpresaOrigenController {
    empresaOrigenService;
    constructor(empresaOrigenService) {
        this.empresaOrigenService = empresaOrigenService;
    }
    async getAll(params) {
        try {
            const empresas = await this.empresaOrigenService.getAll(params);
            return empresas;
        }
        catch (error) {
            manejoDeError("Error obteniendo empresas origen", error);
            throw error;
        }
    }
    async getById(id) {
        try {
            const empresa = await this.empresaOrigenService.getById(id);
            return empresa;
        }
        catch (error) {
            manejoDeError("Error obteniendo empresa origen", error);
            throw error;
        }
    }
    async create(input) {
        try {
            const empresa = await this.empresaOrigenService.create(input);
            return empresa;
        }
        catch (error) {
            manejoDeError("Error creando empresa origen", error);
            throw error;
        }
    }
    async update(id, input) {
        try {
            const empresa = await this.empresaOrigenService.update(id, input);
            return empresa;
        }
        catch (error) {
            manejoDeError("Error actualizando empresa origen", error);
            throw error;
        }
    }
    async delete(id) {
        try {
            const success = await this.empresaOrigenService.delete(id);
            return success;
        }
        catch (error) {
            manejoDeError("Error eliminando empresa origen", error);
            throw error;
        }
    }
}
//# sourceMappingURL=EmpresaOrigenController.js.map