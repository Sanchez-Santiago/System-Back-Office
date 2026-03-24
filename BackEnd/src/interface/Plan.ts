import { Plan, PlanCreate } from "../schemas/venta/Plan";
import { ModelDB } from "./model";

export interface PlanModelDB extends Omit<ModelDB<Plan>, 'add'> {
  add(params: { input: PlanCreate }): Promise<Plan>;

  getByNombre: ({ nombre }: { nombre: string }) => Promise<Plan | undefined>;

  getByEmpresa: ({ empresa }: { empresa: number }) => Promise<Plan[]>;

  getAllWithFilter: (params: { page?: number; limit?: number; pais?: string }) => Promise<Plan[]>;
}
