export class MensajeController {
    service;
    constructor(service) {
        this.service = service;
    }
    // ======================
    // CRUD BÁSICO
    // ======================
    /**
     * Crea un nuevo mensaje (ALERTA o NOTIFICACION)
     * Con resolución automática de destinatarios
     */
    async create(params) {
        return this.service.create(params);
    }
    /**
     * Obtiene mensaje por ID
     */
    async getById({ mensaje_id }) {
        return this.service.getById({ mensaje_id });
    }
    // ======================
    // INBOX Y NOTIFICACIONES
    // ======================
    /**
     * Obtiene inbox de un usuario (mensajes que le pertenecen)
     */
    async getInbox(params) {
        return this.service.getInbox(params);
    }
    /**
     * Cuenta mensajes no leídos de un usuario
     */
    async countNoLeidos({ usuario_id }) {
        return this.service.countNoLeidos({ usuario_id });
    }
    /**
     * Marca un mensaje como leído
     */
    async marcarComoLeido(params) {
        return this.service.marcarComoLeido(params);
    }
    // ======================
    // ALERTAS
    // ======================
    /**
     * Resuelve una alerta
     * Solo SUPERVISOR o ADMIN pueden resolver
     */
    async resolverAlerta(params) {
        return this.service.resolverAlerta(params);
    }
    /**
     * Obtiene alertas pendientes de resolución
     */
    async getAlertasPendientes(params) {
        return this.service.getAlertasPendientes(params);
    }
    /**
     * Obtiene alertas por referencia (ej: venta_id)
     */
    async getAlertasByReferencia(params) {
        return this.service.getAlertasByReferencia(params);
    }
    // ======================
    // BÚSQUEDA
    // ======================
    /**
     * Obtiene mensajes por tipo
     */
    async getByTipo(params) {
        return this.service.getByTipo(params);
    }
}
//# sourceMappingURL=MensajeController.js.map