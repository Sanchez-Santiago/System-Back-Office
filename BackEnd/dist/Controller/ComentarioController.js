export class ComentarioController {
    service;
    constructor(service) {
        this.service = service;
    }
    // ======================
    // CRUD BÁSICO
    // ======================
    /**
     * Crea un nuevo comentario
     */
    async create(params) {
        return this.service.create(params);
    }
    /**
     * Obtiene comentario por ID
     */
    async getById({ comentario_id }) {
        return this.service.getById({ comentario_id });
    }
    /**
     * Actualiza un comentario
     */
    async update(params) {
        return this.service.update(params);
    }
    /**
     * Elimina un comentario
     */
    async delete(params) {
        return this.service.delete(params);
    }
    // ======================
    // MÉTODOS DE CONSULTA
    // ======================
    /**
     * Obtiene todos los comentarios con filtros
     */
    async getAll(params) {
        return this.service.getAll(params);
    }
    /**
     * Obtiene comentarios por venta_id
     */
    async getByVentaId(params) {
        return this.service.getByVentaId(params);
    }
    /**
     * Obtiene el último comentario de una venta
     */
    async getUltimoByVentaId({ venta_id, }) {
        return this.service.getUltimoByVentaId({ venta_id });
    }
    /**
     * Obtiene comentarios por usuario_id
     */
    async getByUsuarioId(params) {
        return this.service.getByUsuarioId(params);
    }
}
//# sourceMappingURL=ComentarioController.js.map