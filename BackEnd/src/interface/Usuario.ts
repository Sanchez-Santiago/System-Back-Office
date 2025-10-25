import { Usuario } from "../schemas/persona/User.ts";
import { ModelDB } from "./model.ts";

export interface UserModelDB extends ModelDB<Usuario> {
  getByLegajo: ({ legajo }: { legajo: string }) => Promise<Usuario | undefined>;

  getByExa: ({ exa }: { exa: string }) => Promise<Usuario | undefined>;

  getByEmail: ({ email }: { email: string }) => Promise<Usuario | undefined>;

  updatePassword(params: {
    id: string;
    newPasswordHash: string;
  }): Promise<boolean>;

  getPasswordHash({ id }: { id: string }): Promise<string | undefined>;
}
