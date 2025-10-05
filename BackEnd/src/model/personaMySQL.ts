import { PersonaModelDB } from "../interface/Persona.ts";
import { Persona } from "../schemas/persona/Persona.ts";

export class PersonaModelMySQL implements PersonaModelDB {
  constructor() {
    // Initialize the database connection here
  }

  connection: unknown;

  getAll: (params: {
    page?: number;
    limit?: number;
    name?: string;
    email?: string;
  }) => Promise<U[] | undefined>;

  getById: ({ id }: { id: string }) => Promise<U | undefined>;

  add: (params: {
    input: T;
  }) => Promise<U>;

  update: (params: {
    id: string;
    input: Partial<U>; // permitís patches parciales
  }) => Promise<U | undefined>;

  delete: (params: {
    id: string;
  }) => Promise<boolean>;

  getByEmail: ({ email }: { email: string }) => Promise<Persona | undefined>;

  getBydocumento: (
    { documento }: { documento: string },
  ) => Promise<Persona | undefined>;
}
