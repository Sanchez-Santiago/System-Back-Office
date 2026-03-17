// ============================================
// BackEnd/src/services/ComentarioService.ts
// Servicio con lógica de permisos para comentarios
// ============================================
import { ComentarioCreateSchema, } from "../schemas/venta/Comentario.ts";
import { logger } from "../Utils/logger.ts";
/**
 * Servicio de Comentarios
 * Gestiona la lógica de negocio y permisos
 */
export class ComentarioService {
    model;
    constructor(model) {
        this.model = model;
    }
    // ======================
    // CRUD BÁSICO
    // ======================
    /**
     * Crea un nuevo comentario
     * Permisos:
     * - VENDEDOR: Solo puede crear en ventas que le pertenecen
     * - Otros roles: Pueden crear en cualquier venta
     */
    async create(params) {
        try {
            const { input, usuario_id, usuario_rol } = params;
            // Validar con Zod
            const validated = ComentarioCreateSchema.parse(input);
            // Verificar permisos si es VENDEDOR
            if (usuario_rol === "VENDEDOR") {
                const esSuVenta = await this.model.esVentaDelVendedor({
                    venta_id: validated.venta_id,
                    vendedor_id: usuario_id,
                });
                if (!esSuVenta) {
                    throw new Error("No tiene permisos para comentar en esta venta. Solo puede comentar en ventas que le pertenecen.");
                }
            }
            // Crear el comentario
            return this.model.add({ input: validated });
        }
        catch (error) {
            logger.error("Error en ComentarioService.create:", error);
            throw error;
        }
    }
    /**
     * Obtiene comentario por ID
     */
    async getById({ comentario_id }) {
        try {
            return this.model.getById({ comentario_id });
        }
        catch (error) {
            logger.error("Error en ComentarioService.getById:", error);
            throw error;
        }
    }
    /**
     * Actualiza un comentario
     * Permisos:
     * - Creador del comentario: Puede actualizar
     * - SUPERADMIN: Puede actualizar cualquiera
     * - Otros: No pueden actualizar
     */
    async update(params) {
        try {
            const { comentario_id, input, usuario_id, usuario_rol } = params;
            // Verificar que el comentario existe
            const comentario = await this.model.getById({ comentario_id });
            if (!comentario) {
                throw new Error("Comentario no encontrado");
            }
            // Verificar permisos
            const puedeEditar = await this.puedeModificarComentario({
                comentario_id,
                usuario_id,
                usuario_rol,
            });
            if (!puedeEditar) {
                throw new Error("No tiene permisos para editar este comentario. Solo el creador o SUPERADMIN pueden editarlo.");
            }
            return this.model.update({ comentario_id, input });
        }
        catch (error) {
            logger.error("Error en ComentarioService.update:", error);
            throw error;
        }
    }
    /**
     * Elimina un comentario
     * Permisos:
     * - Creador del comentario: Puede eliminar
     * - SUPERADMIN: Puede eliminar cualquiera
     * - Otros: No pueden eliminar
     */
    async delete(params) {
        try {
            const { comentario_id, usuario_id, usuario_rol } = params;
            // Verificar que el comentario existe
            const comentario = await this.model.getById({ comentario_id });
            if (!comentario) {
                throw new Error("Comentario no encontrado");
            }
            // Verificar permisos
            const puedeEliminar = await this.puedeModificarComentario({
                comentario_id,
                usuario_id,
                usuario_rol,
            });
            if (!puedeEliminar) {
                throw new Error("No tiene permisos para eliminar este comentario. Solo el creador o SUPERADMIN pueden eliminarlo.");
            }
            return this.model.delete({ comentario_id });
        }
        catch (error) {
            logger.error("Error en ComentarioService.delete:", error);
            throw error;
        }
    }
    // ======================
    // MÉTODOS DE CONSULTA
    // ======================
    /**
     * Obtiene todos los comentarios con filtros
     */
    async getAll(params) {
        try {
            return this.model.getAll(params);
        }
        catch (error) {
            logger.error("Error en ComentarioService.getAll:", error);
            throw error;
        }
    }
    /**
     * Obtiene comentarios por venta_id
     * Todos los usuarios autenticados pueden ver
     */
    async getByVentaId(params) {
        try {
            const { venta_id, page = 1, limit = 20 } = params;
            if (page < 1 || limit < 1) {
                throw new Error("Los valores de paginación deben ser mayores a 0");
            }
            if (limit > 100) {
                throw new Error("El límite máximo es 100 comentarios por página");
            }
            return this.model.getByVentaId({ venta_id, page, limit });
        }
        catch (error) {
            logger.error("Error en ComentarioService.getByVentaId:", error);
            throw error;
        }
    }
    /**
     * Obtiene el último comentario de una venta
     */
    async getUltimoByVentaId({ venta_id, }) {
        try {
            return this.model.getUltimoByVentaId({ venta_id });
        }
        catch (error) {
            logger.error("Error en ComentarioService.getUltimoByVentaId:", error);
            throw error;
        }
    }
    /**
     * Obtiene comentarios por usuario_id
     */
    async getByUsuarioId(params) {
        try {
            const { usuario_id, page = 1, limit = 20 } = params;
            if (page < 1 || limit < 1) {
                throw new Error("Los valores de paginación deben ser mayores a 0");
            }
            if (limit > 100) {
                throw new Error("El límite máximo es 100 comentarios por página");
            }
            return this.model.getByUsuarioId({ usuario_id, page, limit });
        }
        catch (error) {
            logger.error("Error en ComentarioService.getByUsuarioId:", error);
            throw error;
        }
    }
    // ======================
    // MÉTODOS AUXILIARES
    // ======================
    /**
     * Verifica si un usuario puede modificar (editar/eliminar) un comentario
     */
    async puedeModificarComentario(params) {
        const { comentario_id, usuario_id, usuario_rol } = params;
        // SUPERADMIN puede modificar cualquier comentario
        if (usuario_rol === "SUPERADMIN") {
            return true;
        }
        // Verificar si el usuario es el creador del comentario
        const creadorId = await this.model.getCreadorId({ comentario_id });
        return creadorId === usuario_id;
    }
}
//# sourceMappingURL=ComentarioService.js.map