// ============================================
// BackEnd/src/models/correo/EstadoCorreoModelDB.ts
// ============================================

import { ModelDB } from "./model.ts";
import {
  EstadoCorreo,
  EstadoCorreoCreate,
  EstadoCorreoUpdate,
} from "../schemas/correo/EstadoCorreo.ts";

export interface EstadoCorreoModelDB extends
  Omit<
    ModelDB<EstadoCorreoCreate, EstadoCorreo>,
    "getAll" | "getById" | "update" | "delete"
  > {
  connection: unknown;

  getAll(): Promise<EstadoCorreo[]>;

  getById(params: { id: number }): Promise<EstadoCorreo | undefined>;

  update(params: {
    id: number;
    input: EstadoCorreoUpdate;
  }): Promise<EstadoCorreo | undefined>;

  delete(params: { id: number }): Promise<boolean>;

  getBySAP(params: { sap: string }): Promise<EstadoCorreo[]>;

  getLastBySAP(params: { sap: string }): Promise<EstadoCorreo | undefined>;
}
