import client from "../../database/MySQL.ts";
import { UserModelDB } from "../../interface/Usuario.ts";
import { Usuario, UsuarioCreate, UsuarioUpdate } from "../../schemas/persona/User.ts";
export declare class UsuarioMySQL implements UserModelDB {
    connection: typeof client;
    constructor(connection: typeof client);
    private baseSelect;
    getAll(params: {
        page?: number;
        limit?: number;
        name?: string;
        email?: string;
    }): Promise<Usuario[] | undefined>;
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
    private mapPermisos;
    consultarPermisos(permisos: string[]): Promise<string[]>;
    add({ input }: {
        input: UsuarioCreate;
    }): Promise<Usuario>;
    update({ id, input, }: {
        id: string;
        input: Partial<UsuarioUpdate>;
    }): Promise<Usuario | undefined>;
    delete({ id }: {
        id: string;
    }): Promise<boolean>;
    getPasswordHash({ id }: {
        id: string;
    }): Promise<string | undefined>;
    updatePassword({ id, newPasswordHash, }: {
        id: string;
        newPasswordHash: string;
    }): Promise<boolean>;
    isPasswordUsedBefore({ id, passwordHash, }: {
        id: string;
        passwordHash: string;
    }): Promise<boolean>;
    getFailedAttemptsDB({ id }: {
        id: string;
    }): Promise<number>;
    incrementFailedAttemptsDB({ id }: {
        id: string;
    }): Promise<boolean>;
    resetFailedAttemptsDB({ id }: {
        id: string;
    }): Promise<boolean>;
    getPasswordHistory({ id, limit, }: {
        id: string;
        limit?: number;
    }): Promise<Array<{
        password_hash: string;
        fecha_creacion: Date;
    }>>;
}
//# sourceMappingURL=usuarioMySQL.d.ts.map