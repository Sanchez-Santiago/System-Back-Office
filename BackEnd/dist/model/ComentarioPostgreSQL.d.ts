import { PostgresClient } from "../database/PostgreSQL.ts";
import { ComentarioModelDB } from "../interface/Comentario.ts";
import { Comentario, ComentarioCreate, ComentarioUpdate, ComentarioConUsuario } from "../schemas/venta/Comentario.ts";
export declare class ComentarioPostgreSQL implements ComentarioModelDB {
    connection: PostgresClient;
    constructor(connection: PostgresClient);
    private logInfo;
    private logError;
    private mapRowToComentario;
    private mapRowToComentarioConUsuario;
    add({ input }: {
        input: ComentarioCreate;
    }): Promise<Comentario>;
    getById({ comentario_id, }: {
        comentario_id: number;
    }): Promise<Comentario | undefined>;
    update({ comentario_id, input, }: {
        comentario_id: number;
        input: ComentarioUpdate;
    }): Promise<Comentario | undefined>;
    delete({ comentario_id }: {
        comentario_id: number;
    }): Promise<boolean>;
    getAll({ page, limit, venta_id, usuario_id, tipo_comentario, fecha_desde, fecha_hasta, }: {
        page?: number;
        limit?: number;
        venta_id?: number;
        usuario_id?: string;
        tipo_comentario?: string;
        fecha_desde?: Date;
        fecha_hasta?: Date;
    }): Promise<Comentario[]>;
    getByVentaId({ venta_id, page, limit, }: {
        venta_id: number;
        page?: number;
        limit?: number;
    }): Promise<ComentarioConUsuario[]>;
    getUltimoByVentaId({ venta_id, }: {
        venta_id: number;
    }): Promise<ComentarioConUsuario | undefined>;
    getByUsuarioId({ usuario_id, page, limit, }: {
        usuario_id: string;
        page?: number;
        limit?: number;
    }): Promise<Comentario[]>;
    esVentaDelVendedor({ venta_id, vendedor_id, }: {
        venta_id: number;
        vendedor_id: string;
    }): Promise<boolean>;
    getCreadorId({ comentario_id, }: {
        comentario_id: number;
    }): Promise<string | undefined>;
}
//# sourceMappingURL=ComentarioPostgreSQL.d.ts.map