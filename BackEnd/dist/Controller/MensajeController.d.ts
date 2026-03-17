import { MensajeService } from "../services/MensajeService.ts";
import { Mensaje, MensajeCreate } from "../schemas/mensaje/Mensaje.ts";
import { MensajeConEstado } from "../schemas/mensaje/MensajeDestinatario.ts";
export declare class MensajeController {
    private service;
    constructor(service: MensajeService);
    /**
     * Crea un nuevo mensaje (ALERTA o NOTIFICACION)
     * Con resolución automática de destinatarios
     */
    create(params: {
        input: MensajeCreate;
        usuario_creador_rol: string;
    }): Promise<Mensaje>;
    /**
     * Obtiene mensaje por ID
     */
    getById({ mensaje_id }: {
        mensaje_id: number;
    }): Promise<Mensaje | undefined>;
    /**
     * Obtiene inbox de un usuario (mensajes que le pertenecen)
     */
    getInbox(params: {
        usuario_id: string;
        page?: number;
        limit?: number;
    }): Promise<MensajeConEstado[]>;
    /**
     * Cuenta mensajes no leídos de un usuario
     */
    countNoLeidos({ usuario_id }: {
        usuario_id: string;
    }): Promise<number>;
    /**
     * Marca un mensaje como leído
     */
    marcarComoLeido(params: {
        mensaje_id: number;
        usuario_id: string;
    }): Promise<boolean>;
    /**
     * Resuelve una alerta
     * Solo SUPERVISOR o ADMIN pueden resolver
     */
    resolverAlerta(params: {
        mensaje_id: number;
    }): Promise<Mensaje | undefined>;
    /**
     * Obtiene alertas pendientes de resolución
     */
    getAlertasPendientes(params: {
        page?: number;
        limit?: number;
    }): Promise<Mensaje[]>;
    /**
     * Obtiene alertas por referencia (ej: venta_id)
     */
    getAlertasByReferencia(params: {
        referencia_id: number;
    }): Promise<Mensaje[]>;
    /**
     * Obtiene mensajes por tipo
     */
    getByTipo(params: {
        tipo: "ALERTA" | "NOTIFICACION";
        page?: number;
        limit?: number;
    }): Promise<Mensaje[]>;
}
//# sourceMappingURL=MensajeController.d.ts.map