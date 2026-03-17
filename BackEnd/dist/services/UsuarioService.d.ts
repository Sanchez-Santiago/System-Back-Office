import { UsuarioSecurity, UsuarioUpdate } from "../schemas/persona/User.ts";
import { UserModelDB } from "../interface/Usuario.ts";
/**
 * Servicio de Usuario
 * ✅ ACTUALIZADO: Adaptado para trabajar sin password_hash en usuario
 */
export declare class UsuarioService {
    private modeUser;
    constructor(modeUser: UserModelDB);
    /**
     * Obtiene todos los usuarios con paginación y filtros opcionales
     */
    getAll(params: {
        page?: number;
        limit?: number;
        name?: string;
        email?: string;
    }): Promise<UsuarioSecurity[] | undefined>;
    /**
     * Obtiene un usuario específico por su ID
     */
    getById({ id }: {
        id: string;
    }): Promise<UsuarioSecurity | undefined>;
    /**
     * Obtiene un usuario por su email
     */
    getByEmail({ email }: {
        email: string;
    }): Promise<UsuarioSecurity | undefined>;
    /**
     * Obtiene un usuario por su legajo
     */
    getByLegajo({ legajo }: {
        legajo: string;
    }): Promise<UsuarioSecurity | undefined>;
    /**
     * Obtiene un usuario por su código EXA
     */
    getByExa({ exa }: {
        exa: string;
    }): Promise<UsuarioSecurity | undefined>;
    /**
     * Actualiza los datos de un usuario existente
     * ✅ NOTA: La contraseña se actualiza a través de AuthService.changePassword()
     */
    update(params: {
        id: string;
        input: Partial<UsuarioUpdate>;
    }): Promise<UsuarioSecurity | undefined>;
    /**
     * Elimina un usuario de forma permanente
     * ✅ NOTA: El CASCADE DELETE eliminará automáticamente las contraseñas
     */
    delete(params: {
        id: string;
    }): Promise<void>;
    /**
     * Verifica si un usuario existe
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
     * Obtiene estadísticas de usuarios
     */
    getStats(): Promise<{
        total: number;
        porRol: Record<string, number>;
        porEstado: Record<string, number>;
    }>;
    /**
     * Cambia el estado de un usuario
     */
    changeStatus(params: {
        id: string;
        estado: "ACTIVO" | "INACTIVO" | "SUSPENDIDO";
    }): Promise<UsuarioSecurity>;
}
//# sourceMappingURL=UsuarioService.d.ts.map