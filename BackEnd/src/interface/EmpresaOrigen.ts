import { ModelDB } from "./model";

export interface EmpresaOrigen {
  empresa_origen_id: number;
  nombre_empresa: string;
  pais: string;
}

export interface EmpresaOrigenCreate {
  nombre_empresa: string;
  pais: string;
}

export interface EmpresaOrigenUpdate {
  nombre_empresa?: string;
  pais?: string;
}

export interface EmpresaOrigenModelDB extends ModelDB<EmpresaOrigenCreate, EmpresaOrigen> {
  getAllWithFilter: (params: { page?: number; limit?: number; pais?: string }) => Promise<EmpresaOrigen[]>;
}
