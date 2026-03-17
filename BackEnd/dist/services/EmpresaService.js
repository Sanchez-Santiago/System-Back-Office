export class EmpresaService {
    modeEmpresa;
    constructor(modeEmpresa) {
        this.modeEmpresa = modeEmpresa;
    }
    async getAll(params = {}) {
        const { page = 1, limit = 10, search } = params;
        const empresas = await this.modeEmpresa.getAll({ page, limit, name: search });
        return empresas || [];
    }
    async getById(id) {
        return await this.modeEmpresa.getById({ id });
    }
    async create(input) {
        return await this.modeEmpresa.add({ input });
    }
    async update(id, input) {
        return await this.modeEmpresa.update({ id, input });
    }
    async delete(id) {
        return await this.modeEmpresa.delete({ id });
    }
}
//# sourceMappingURL=EmpresaService.js.map