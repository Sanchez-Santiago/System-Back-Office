import { ModelDB } from "./model";

export interface Empresa {
  id_empresa: number;
  nombre: string;
  cuit: string;
  entidad: number;
}

export interface EmpresaCreate {
  nombre: string;
  cuit: string;
  entidad: number;
}

export interface EmpresaUpdate {
  nombre?: string;
  cuit?: string;
  entidad?: number;
}

export interface EmpresaModelDB extends ModelDB<EmpresaCreate, Empresa> {
  // Métodos adicionales si son necesarios
}
