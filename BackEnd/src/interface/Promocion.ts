import { Promocion, PromocionCreate } from "../schemas/venta/Promocion";
import { ModelDB } from "./model";

export interface PromocionModelDB extends Omit<ModelDB<Promocion>, 'add'> {
  add(params: { input: PromocionCreate }): Promise<Promocion>;

  getByNombre: ({ nombre }: { nombre: string }) => Promise<Promocion | undefined>;

  getByEmpresa: ({ empresa }: { empresa: string }) => Promise<Promocion[]>;

  getAllWithFilter: (params: { page?: number; limit?: number; pais?: string }) => Promise<Promocion[]>;
}
