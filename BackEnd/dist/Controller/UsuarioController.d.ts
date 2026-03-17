import 'dotenv/config';
import { UsuarioSecurity, UsuarioUpdate } from "../schemas/persona/User.ts";
import { UserModelDB } from "../interface/Usuario.ts";
/**
 * Controlador de Usuario
 *
 * Gestiona las operaciones CRUD de usuarios y actúa como intermediario
 * entre las rutas (router) y la capa de servicio.
 *
 * Responsabilidades:
 * - Validar datos de entrada con Zod
 * - Coordinar llamadas al servicio
 * - Manejar errores de forma consistente
 * - Formatear respuestas
 *
 * @class UsuarioController
 */
export declare class UsuarioController {
    private modeUser;
    private service;
    /**
     * Constructor del controlador
     * @param {UserModelDB} modeUser - Modelo de base de datos para operaciones de usuario
     */
    constructor(modeUser: UserModelDB);
    /**
     * Obtiene todos los usuarios con paginación y filtros
     *
     * @param {Object} params - Parámetros de búsqueda
     * @param {number} [params.page=1] - Número de página
     * @param {number} [params.limit=10] - Cantidad de resultados por página
     * @param {string} [params.name] - Filtro por nombre/apellido
     * @param {string} [params.email] - Filtro por email
     * @returns {Promise<UsuarioSecurity[]>} Array de usuarios sin datos sensibles
     * @throws {Error} Si ocurre un error en la operación
     *
     * @example
     * const usuarios = await controller.getAll({ page: 1, limit: 20 });
     */
    getAll(params: {
        page?: number;
        limit?: number;
        name?: string;
        email?: string;
    }): Promise<UsuarioSecurity[]>;
    /**
     * Obtiene un usuario específico por su ID
     *
     * @param {Object} params - Parámetros de búsqueda
     * @param {string} params.id - UUID del usuario
     * @returns {Promise<UsuarioSecurity>} Usuario sin datos sensibles
     * @throws {Error} Si el usuario no existe o hay un error
     *
     * @example
     * const usuario = await controller.getById({ id: "uuid-here" });
     */
    getById({ id }: {
        id: string;
    }): Promise<UsuarioSecurity>;
    /**
     * Obtiene un usuario por su email
     *
     * @param {Object} params - Parámetros de búsqueda
     * @param {string} params.email - Email del usuario
     * @returns {Promise<UsuarioSecurity>} Usuario sin datos sensibles
     * @throws {Error} Si el usuario no existe o hay un error
     *
     * @example
     * const usuario = await controller.getByEmail({ email: "user@example.com" });
     */
    getByEmail({ email }: {
        email: string;
    }): Promise<UsuarioSecurity>;
    /**
     * Obtiene un usuario por su legajo
     *
     * @param {Object} params - Parámetros de búsqueda
     * @param {string} params.legajo - Legajo del usuario (5 caracteres)
     * @returns {Promise<UsuarioSecurity>} Usuario sin datos sensibles
     * @throws {Error} Si el usuario no existe o hay un error
     *
     * @example
     * const usuario = await controller.getByLegajo({ legajo: "00001" });
     */
    getByLegajo({ legajo }: {
        legajo: string;
    }): Promise<UsuarioSecurity>;
    /**
     * Obtiene un usuario por su código EXA
     *
     * @param {Object} params - Parámetros de búsqueda
     * @param {string} params.exa - Código EXA del usuario (8 caracteres)
     * @returns {Promise<UsuarioSecurity>} Usuario sin datos sensibles
     * @throws {Error} Si el usuario no existe o hay un error
     *
     * @example
     * const usuario = await controller.getByExa({ exa: "AB123456" });
     */
    getByExa({ exa }: {
        exa: string;
    }): Promise<UsuarioSecurity>;
    /**
     * Actualiza los datos de un usuario existente
     *
     * Realiza una actualización parcial, solo modificando los campos proporcionados.
     * No permite actualizar password_hash ni legajo.
     *
     * @param {Object} params - Parámetros de actualización
     * @param {string} params.id - UUID del usuario a actualizar
     * @param {Partial<UsuarioUpdate>} params.input - Datos a actualizar
     * @returns {Promise<UsuarioSecurity>} Usuario actualizado sin datos sensibles
     * @throws {Error} Si el usuario no existe, los datos son inválidos o hay un error
     *
     * @example
     * const usuarioActualizado = await controller.update({
     *   id: "uuid-here",
     *   input: { telefono: "1234567890", estado: "INACTIVO" }
     * });
     */
    update(params: {
        id: string;
        input: Partial<UsuarioUpdate>;
    }): Promise<UsuarioSecurity>;
    /**
     * Elimina un usuario de forma permanente
     *
     * ⚠️ ADVERTENCIA: Esta operación es irreversible
     *
     * @param {Object} params - Parámetros de eliminación
     * @param {string} params.id - UUID del usuario a eliminar
     * @returns {Promise<void>}
     * @throws {Error} Si el usuario no existe o hay un error
     *
     * @example
     * await controller.delete({ id: "uuid-here" });
     */
    delete({ id }: {
        id: string;
    }): Promise<void>;
    /**
     * Verifica si un usuario existe por email, legajo o EXA
     *
     * Útil para validaciones de unicidad antes de crear usuarios.
     *
     * @param {Object} params - Parámetros de verificación
     * @param {string} [params.email] - Email a verificar
     * @param {string} [params.legajo] - Legajo a verificar
     * @param {string} [params.exa] - Código EXA a verificar
     * @returns {Promise<{exists: boolean, field?: string}>} Resultado de la verificación
     *
     * @example
     * const resultado = await controller.exists({ email: "user@example.com" });
     * if (resultado.exists) {
     *   console.log(`Usuario ya existe por: ${resultado.field}`);
     * }
     */
    exists(params: {
        email?: string;
        legajo?: string;
        exa?: string;
    }): Promise<{
        exists: boolean;
        field?: string;
    }>;
    /**
     * Obtiene estadísticas de usuarios por rol
     *
     * @returns {Promise<{total: number, porRol: Record<string, number>}>} Estadísticas
     *
     * @example
     * const stats = await controller.getStats();
     * console.log(`Total: ${stats.total}, Supervisores: ${stats.porRol.SUPERVISOR}`);
     */
    getStats(): Promise<{
        total: number;
        porRol: Record<string, number>;
        porEstado: Record<string, number>;
    }>;
    /**
     * Cambia el estado de un usuario (ACTIVO, INACTIVO, SUSPENDIDO)
     *
     * @param {Object} params - Parámetros de cambio de estado
     * @param {string} params.id - UUID del usuario
     * @param {string} params.estado - Nuevo estado (ACTIVO, INACTIVO, SUSPENDIDO)
     * @returns {Promise<UsuarioSecurity>} Usuario actualizado
     * @throws {Error} Si el usuario no existe o el estado es inválido
     *
     * @example
     * await controller.changeStatus({ id: "uuid-here", estado: "SUSPENDIDO" });
     */
    changeStatus(params: {
        id: string;
        estado: "ACTIVO" | "INACTIVO" | "SUSPENDIDO";
    }): Promise<UsuarioSecurity>;
}
//# sourceMappingURL=UsuarioController.d.ts.map