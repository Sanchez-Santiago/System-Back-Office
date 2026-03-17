export class EmpresaOrigenService {
    modeEmpresaOrigen;
    constructor(modeEmpresaOrigen) {
        this.modeEmpresaOrigen = modeEmpresaOrigen;
    }
    async getAll(params = {}) {
        const { page = 1, limit = 10 } = params;
        const empresas = await this.modeEmpresaOrigen.getAll({ page, limit });
        return empresas || [];
    }
    async getById(id) {
        return await this.modeEmpresaOrigen.getById({ id });
    }
    async create(input) {
        return await this.modeEmpresaOrigen.add({ input });
    }
    async update(id, input) {
        return await this.modeEmpresaOrigen.update({ id, input });
    }
    async delete(id) {
        return await this.modeEmpresaOrigen.delete({ id });
    }
}
//# sourceMappingURL=EmpresaOrigenService.js.map