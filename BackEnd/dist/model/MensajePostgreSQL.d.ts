import { PostgresClient } from "../database/PostgreSQL.ts";
import { MensajeModelDB } from "../interface/Mensaje.ts";
import { Mensaje, MensajeCreate, MensajeUpdate } from "../schemas/mensaje/Mensaje.ts";
import { MensajeConEstado, MensajeDestinatario } from "../schemas/mensaje/MensajeDestinatario.ts";
export declare class MensajePostgreSQL implements MensajeModelDB {
    connection: PostgresClient;
    constructor(connection: PostgresClient);
    private logInfo;
    private logWarn;
    private logError;
    private mapRowToMensaje;
    private mapRowToMensajeConEstado;
    private mapRowToDestinatario;
    add({ input }: {
        input: MensajeCreate;
    }): Promise<Mensaje>;
    getById({ mensaje_id, }: {
        mensaje_id: number;
    }): Promise<Mensaje | undefined>;
    update({ mensaje_id, input, }: {
        mensaje_id: number;
        input: MensajeUpdate;
    }): Promise<Mensaje | undefined>;
    delete({ mensaje_id }: {
        mensaje_id: number;
    }): Promise<boolean>;
    addDestinatario({ mensaje_id, usuario_id, }: {
        mensaje_id: number;
        usuario_id: string;
    }): Promise<MensajeDestinatario>;
    addDestinatarios({ mensaje_id, usuarios_ids, }: {
        mensaje_id: number;
        usuarios_ids: string[];
    }): Promise<number>;
    marcarComoLeido({ mensaje_id, usuario_id, }: {
        mensaje_id: number;
        usuario_id: string;
    }): Promise<boolean>;
    marcarComoNoLeido({ mensaje_id, usuario_id, }: {
        mensaje_id: number;
        usuario_id: string;
    }): Promise<boolean>;
    getInbox({ usuario_id, page, limit, }: {
        usuario_id: string;
        page?: number;
        limit?: number;
    }): Promise<MensajeConEstado[]>;
    getNoLeidos({ usuario_id, }: {
        usuario_id: string;
    }): Promise<MensajeConEstado[]>;
    countNoLeidos({ usuario_id }: {
        usuario_id: string;
    }): Promise<number>;
    resolverAlerta({ mensaje_id, }: {
        mensaje_id: number;
    }): Promise<Mensaje | undefined>;
    getAlertasPendientes({ page, limit, }: {
        page?: number;
        limit?: number;
    }): Promise<Mensaje[]>;
    getAlertasResueltas({ page, limit, }: {
        page?: number;
        limit?: number;
    }): Promise<Mensaje[]>;
    getAlertasByReferencia({ referencia_id, }: {
        referencia_id: number;
    }): Promise<Mensaje[]>;
    getByTipo({ tipo, page, limit, }: {
        tipo: "ALERTA" | "NOTIFICACION";
        page?: number;
        limit?: number;
    }): Promise<Mensaje[]>;
    getByUsuarioCreador({ usuario_id, page, limit, }: {
        usuario_id: string;
        page?: number;
        limit?: number;
    }): Promise<Mensaje[]>;
    getByFechaRango({ fechaInicio, fechaFin, page, limit, }: {
        fechaInicio: Date;
        fechaFin: Date;
        page?: number;
        limit?: number;
    }): Promise<Mensaje[]>;
    getEstadisticas(): Promise<{
        totalMensajes: number;
        totalAlertas: number;
        totalNotificaciones: number;
        alertasPendientes: number;
        alertasResueltas: number;
    }>;
    resolverDestinatarios({ tipo, valor, referencia_id, }: {
        tipo: "USUARIO" | "ROL" | "CELULA" | "VENTA_RELACIONADA" | "GLOBAL";
        valor?: string;
        referencia_id?: number;
    }): Promise<string[]>;
}
//# sourceMappingURL=MensajePostgreSQL.d.ts.map