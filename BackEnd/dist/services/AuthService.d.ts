import 'dotenv/config';
import { CambioPassword, CambioPasswordAdmin, UsuarioCreate, UsuarioLogin } from "../schemas/persona/User.ts";
import { UserModelDB } from "../interface/Usuario.ts";
export declare class AuthService {
    private modeUser;
    constructor(modeUser: UserModelDB);
    getAllFailedAttempts(): never[];
    private createJWTKey;
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
    getPasswordHistory(userId: string): Promise<Array<{
        password_hash: string;
        fecha_creacion: Date;
    }>>;
    verifyToken(token: string): Promise<import("jose").JWTPayload>;
    refreshToken(oldToken: string): Promise<string>;
    changePassword(params: {
        targetUserId: string;
        authenticatedUserId: string;
        authenticatedUserRole: string;
        passwordData: CambioPassword | CambioPasswordAdmin;
    }): Promise<void>;
}
//# sourceMappingURL=AuthService.d.ts.map