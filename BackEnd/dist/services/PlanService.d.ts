import { PlanModelDB } from "../interface/Plan.ts";
import { PlanCreate, PlanUpdate } from "../schemas/venta/Plan.ts";
export declare class PlanService {
    private modePlan;
    constructor(modePlan: PlanModelDB);
    getAll(params?: {
        page?: number;
        limit?: number;
    }): Promise<{
        nombre: string;
        fecha_creacion: Date;
        plan_id: number;
        empresa_origen_id: number;
        precio: number;
        gigabyte: number;
        llamadas: string;
        mensajes: string;
        whatsapp: string;
        roaming: string;
        activo: boolean;
        promocion_id?: number | null | undefined;
        beneficios?: string | null | undefined;
        fecha_duracion?: Date | null | undefined;
    }[] | undefined>;
    getById(id: string): Promise<{
        nombre: string;
        fecha_creacion: Date;
        plan_id: number;
        empresa_origen_id: number;
        precio: number;
        gigabyte: number;
        llamadas: string;
        mensajes: string;
        whatsapp: string;
        roaming: string;
        activo: boolean;
        promocion_id?: number | null | undefined;
        beneficios?: string | null | undefined;
        fecha_duracion?: Date | null | undefined;
    } | undefined>;
    create(input: PlanCreate): Promise<{
        nombre: string;
        fecha_creacion: Date;
        plan_id: number;
        empresa_origen_id: number;
        precio: number;
        gigabyte: number;
        llamadas: string;
        mensajes: string;
        whatsapp: string;
        roaming: string;
        activo: boolean;
        promocion_id?: number | null | undefined;
        beneficios?: string | null | undefined;
        fecha_duracion?: Date | null | undefined;
    }>;
    update(id: string, input: PlanUpdate): Promise<{
        nombre: string;
        fecha_creacion: Date;
        plan_id: number;
        empresa_origen_id: number;
        precio: number;
        gigabyte: number;
        llamadas: string;
        mensajes: string;
        whatsapp: string;
        roaming: string;
        activo: boolean;
        promocion_id?: number | null | undefined;
        beneficios?: string | null | undefined;
        fecha_duracion?: Date | null | undefined;
    } | undefined>;
    delete(id: string): Promise<boolean>;
    getByEmpresa(params: {
        empresa: number;
    }): Promise<{
        nombre: string;
        fecha_creacion: Date;
        plan_id: number;
        empresa_origen_id: number;
        precio: number;
        gigabyte: number;
        llamadas: string;
        mensajes: string;
        whatsapp: string;
        roaming: string;
        activo: boolean;
        promocion_id?: number | null | undefined;
        beneficios?: string | null | undefined;
        fecha_duracion?: Date | null | undefined;
    }[]>;
}
//# sourceMappingURL=PlanService.d.ts.map