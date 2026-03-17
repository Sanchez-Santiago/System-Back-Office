import { MensajeModelDB } from "../interface/Mensaje.ts";
import { Mensaje, MensajeCreate } from "../schemas/mensaje/Mensaje.ts";
import { MensajeConEstado } from "../schemas/mensaje/MensajeDestinatario.ts";
/**
 * Servicio de Mensajes
 * Gestiona la lógica de negocio para alertas y notificaciones
 */
export declare class MensajeService {
    private model;
    constructor(model: MensajeModelDB);
    /**
     * Crea un nuevo mensaje con resolución automática de destinatarios
     * Valida permisos según el tipo de mensaje
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
     * Valida que el usuario sea el destinatario
     */
    marcarComoLeido(params: {
        mensaje_id: number;
        usuario_id: string;
    }): Promise<boolean>;
    /**
     * Resuelve una alerta
     * Solo SUPERVISOR o ADMIN pueden resolver alertas
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
    /**
     * Resuelve los destinatarios según el tipo
     * Retorna array de persona_ids (UUIDs)
     */
    resolverDestinatarios(params: {
        tipo: "USUARIO" | "ROL" | "CELULA" | "VENTA_RELACIONADA" | "GLOBAL";
        valor?: string;
        referencia_id?: number;
    }): Promise<string[]>;
}
//# sourceMappingURL=MensajeService.d.ts.map