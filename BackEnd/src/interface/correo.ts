import { Correo } from "../schemas/correo/Correo.ts";
import { ModelDB } from "./model.ts";

export interface CorreoModelDB extends ModelDB<Correo> {
  getBySAP: ({ sap }: { sap: string }) => Promise<Correo | undefined>;
}
