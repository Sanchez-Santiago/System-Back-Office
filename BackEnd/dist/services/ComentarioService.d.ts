import { ComentarioModelDB } from "../interface/Comentario.ts";
import { Comentario, ComentarioCreate, ComentarioUpdate, ComentarioConUsuario } from "../schemas/venta/Comentario.ts";
/**
 * Servicio de Comentarios
 * Gestiona la lógica de negocio y permisos
 */
export declare class ComentarioService {
    private model;
    constructor(model: ComentarioModelDB);
    /**
     * Crea un nuevo comentario
     * Permisos:
     * - VENDEDOR: Solo puede crear en ventas que le pertenecen
     * - Otros roles: Pueden crear en cualquier venta
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
     * Permisos:
     * - Creador del comentario: Puede actualizar
     * - SUPERADMIN: Puede actualizar cualquiera
     * - Otros: No pueden actualizar
     */
    update(params: {
        comentario_id: number;
        input: ComentarioUpdate;
        usuario_id: string;
        usuario_rol: string;
    }): Promise<Comentario | undefined>;
    /**
     * Elimina un comentario
     * Permisos:
     * - Creador del comentario: Puede eliminar
     * - SUPERADMIN: Puede eliminar cualquiera
     * - Otros: No pueden eliminar
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
     * Todos los usuarios autenticados pueden ver
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
    /**
     * Verifica si un usuario puede modificar (editar/eliminar) un comentario
     */
    private puedeModificarComentario;
}
//# sourceMappingURL=ComentarioService.d.ts.map