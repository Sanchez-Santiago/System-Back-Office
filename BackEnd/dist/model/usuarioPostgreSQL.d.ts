import { PostgresClient } from "../database/PostgreSQL.ts";
import { UserModelDB } from "../interface/Usuario.ts";
import { Usuario, UsuarioCreate } from "../schemas/persona/User.ts";
export declare class UsuarioPostgreSQL implements UserModelDB {
    connection: PostgresClient;
    constructor(connection: PostgresClient);
    private baseSelect;
    private mapPermisos;
    private logSuccess;
    private logWarning;
    private logError;
    private esPermisoValido;
    getAll({ page, limit, name, email, }: {
        page?: number;
        limit?: number;
        name?: string;
        email?: string;
    }): Promise<Usuario[]>;
    getById({ id }: {
        id: string;
    }): Promise<Usuario | undefined>;
    getByEmail({ email }: {
        email: string;
    }): Promise<Usuario | undefined>;
    getByLegajo({ legajo }: {
        legajo: string;
    }): Promise<Usuario | undefined>;
    getByExa({ exa }: {
        exa: string;
    }): Promise<Usuario | undefined>;
    updatePassword(params: {
        id: string;
        newPasswordHash: string;
    }): Promise<boolean>;
    getPasswordHash({ id }: {
        id: string;
    }): Promise<string | undefined>;
    getPasswordHistory({ id, limit }: {
        id: string;
        limit?: number;
    }): Promise<Array<{
        password_hash: string;
        fecha_creacion: Date;
    }>>;
    isPasswordUsedBefore({ id, passwordHash }: {
        id: string;
        passwordHash: string;
    }): Promise<boolean>;
    getFailedAttemptsDB({ id }: {
        id: string;
    }): Promise<number>;
    incrementFailedAttemptsDB({ id }: {
        id: string;
    }): Promise<void>;
    resetFailedAttemptsDB({ id }: {
        id: string;
    }): Promise<void>;
    add({ input }: {
        input: UsuarioCreate;
    }): Promise<Usuario>;
    private consultarPermisos;
    update(params: {
        id: string;
        input: Partial<Usuario>;
    }): Promise<Usuario | undefined>;
    delete(params: {
        id: string;
    }): Promise<boolean>;
}
//# sourceMappingURL=usuarioPostgreSQL.d.ts.map