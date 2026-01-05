import { Usuario, UsuarioCreate } from "../schemas/persona/User.ts";
import { ModelDB } from "./model.ts";

export interface UserModelDB extends Omit<ModelDB<Usuario>, 'add'> {
  add(params: { input: UsuarioCreate }): Promise<Usuario>;

  getByLegajo: ({ legajo }: { legajo: string }) => Promise<Usuario | undefined>;

  getByExa: ({ exa }: { exa: string }) => Promise<Usuario | undefined>;

  getByEmail: ({ email }: { email: string }) => Promise<Usuario | undefined>;

  updatePassword(params: {
    id: string;
    newPasswordHash: string;
  }): Promise<boolean>;

  getPasswordHash({ id }: { id: string }): Promise<string | undefined>;

  getPasswordHistory({ id, limit }: { id: string; limit?: number }): Promise<Array<{ password_hash: string; fecha_creacion: Date; }>>;

  isPasswordUsedBefore({ id, passwordHash }: { id: string; passwordHash: string }): Promise<boolean>;
}
