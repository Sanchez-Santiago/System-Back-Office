import 'dotenv/config';
import { UsuarioCreate, UsuarioLogin } from "../schemas/persona/User.ts";
import type { AuthenticatedUser, PasswordDataRaw } from "../types/userAuth.ts";
import { UserModelDB } from "../interface/Usuario.ts";
import { AuthService } from "../services/AuthService.ts";
export declare class AuthController {
    private modeUser;
    private authService;
    constructor(modeUser: UserModelDB, authService?: AuthService);
    login(input: {
        user: UsuarioLogin;
    }): Promise<{
        token: string;
        user: {
            id: string;
            email: string;
            nombre: string;
            apellido: string;
            exa: string;
            legajo: string;
            rol: "ADMIN" | "SUPERADMIN" | "SUPERVISOR" | "BACK_OFFICE" | "VENDEDOR";
            permisos: string[];
        };
    }>;
    register(input: {
        user: UsuarioCreate;
    }): Promise<string>;
    verifyToken(token: string): Promise<import("jose").JWTPayload>;
    refreshToken(oldToken: string): Promise<string>;
    /**
     * Cambia la contraseña de un usuario
     * ✅ ACTUALIZADO: Ahora valida que no se reutilicen contraseñas anteriores
     */
    changePassword(params: {
        targetUserId: string;
        authenticatedUser: AuthenticatedUser;
        passwordData: PasswordDataRaw;
    }): Promise<void>;
    /**
     * ✅ NUEVO: Obtiene el historial de contraseñas de un usuario
     * Solo para BACK_OFFICE
     */
    getPasswordHistory(params: {
        userId: string;
        requestingUserId: string;
        requestingUserRole: string;
        limit?: number;
    }): Promise<Array<{
        password_hash: string;
        fecha_creacion: Date;
    }>>;
    /**
     * Desbloquea una cuenta de usuario (solo admins)
     */
    unlockAccount(params: {
        targetUserId: string;
        authenticatedUser: AuthenticatedUser;
    }): Promise<void>;
    /**
     * Obtener todos los intentos fallidos (debug)
     */
    getAllFailedAttempts(): never[];
    /**
     * Obtiene el servicio de autenticación para acceso externo
     */
    getAuthService(): AuthService;
}
//# sourceMappingURL=AuthController.d.ts.map