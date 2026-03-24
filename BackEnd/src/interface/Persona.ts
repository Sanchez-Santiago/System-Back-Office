import { Persona } from "../schemas/persona/Persona";
import { ModelDB } from "./model";

export interface PersonaModelDB extends ModelDB<Persona> {
  getByEmail: ({ email }: { email: string }) => Promise<Persona | undefined>;

  getBydocumento: (
    { documento }: { documento: string },
  ) => Promise<Persona | undefined>;
}
