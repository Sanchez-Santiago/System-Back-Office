import { ComentarioService } from "../services/ComentarioService.ts";
import { Comentario, ComentarioCreate, ComentarioUpdate, ComentarioConUsuario } from "../schemas/venta/Comentario.ts";
export declare class ComentarioController {
    private service;
    constructor(service: ComentarioService);
    /**
     * Crea un nuevo comentario
     */
    create(params: {
        input: ComentarioCreate;
        usuario_id: string;
        usuario_rol: string;
    }): Promise<Comentario>;
    /**
     * Obtiene comentario por ID
     */
    getById({ comentario_id }: {
        comentario_id: number;
    }): Promise<Comentario | undefined>;
    /**
     * Actualiza un comentario
     */
    update(params: {
        comentario_id: number;
        input: ComentarioUpdate;
        usuario_id: string;
        usuario_rol: string;
    }): Promise<Comentario | undefined>;
    /**
     * Elimina un comentario
     */
    delete(params: {
        comentario_id: number;
        usuario_id: string;
        usuario_rol: string;
    }): Promise<boolean>;
    /**
     * Obtiene todos los comentarios con filtros
     */
    getAll(params: {
        page?: number;
        limit?: number;
        venta_id?: number;
        usuario_id?: string;
        tipo_comentario?: string;
        fecha_desde?: Date;
        fecha_hasta?: Date;
    }): Promise<Comentario[]>;
    /**
     * Obtiene comentarios por venta_id
     */
    getByVentaId(params: {
        venta_id: number;
        page?: number;
        limit?: number;
    }): Promise<ComentarioConUsuario[]>;
    /**
     * Obtiene el último comentario de una venta
     */
    getUltimoByVentaId({ venta_id, }: {
        venta_id: number;
    }): Promise<ComentarioConUsuario | undefined>;
    /**
     * Obtiene comentarios por usuario_id
     */
    getByUsuarioId(params: {
        usuario_id: string;
        page?: number;
        limit?: number;
    }): Promise<Comentario[]>;
}
//# sourceMappingURL=ComentarioController.d.ts.map