export class EstadoVentaService {
    model;
    constructor(model) {
        this.model = model;
    }
    async getAll(params = {}) {
        return this.model.getAll(params);
    }
    async getById({ id }) {
        return this.model.getById({ id });
    }
    async getByVentaId({ venta_id }) {
        return this.model.getByVentaId({ venta_id });
    }
    async getLastByVentaId({ venta_id }) {
        return this.model.getLastByVentaId({ venta_id });
    }
    async getEstadoActualByVentaId({ venta_id }) {
        return this.model.getEstadoActualByVentaId({ venta_id });
    }
    async getByFechaRango(params) {
        return this.model.getByFechaRango(params);
    }
    async getByEstado({ estado }) {
        return this.model.getByEstado({ estado });
    }
    async getByMultipleFilters(params) {
        return this.model.getByMultipleFilters(params);
    }
    async create(input) {
        return this.model.add({ input });
    }
    async update({ id, input }) {
        return this.model.update({ id, input });
    }
    async delete({ id }) {
        return this.model.delete({ id });
    }
    async getAllLastEstado() {
        return this.model.getAllLastEstado();
    }
    async bulkCreate(estados) {
        return this.model.bulkCreateEstados(estados);
    }
}
//# sourceMappingURL=EstadoVentaService.js.map