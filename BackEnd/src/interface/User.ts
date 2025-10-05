import { Usuario } from "../schemas/persona/User.ts";
import { ModelDB } from "./model.ts";

export interface UserModelDB extends ModelDB<Usuario> {
  getByLegajo: ({ legajo }: { legajo: string }) => Promise<Usuario | undefined>;

  getByExa: ({ Exa }: { Exa: string }) => Promise<Usuario | undefined>;
}
