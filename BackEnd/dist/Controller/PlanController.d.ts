import { PlanCreate, PlanUpdate } from "../schemas/venta/Plan.ts";
import { PlanService } from "../services/PlanService.ts";
export declare class PlanController {
    private planService;
    constructor(planService: PlanService);
    getAll(input: {
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
    getById(input: {
        id: string;
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
    } | undefined>;
    create(input: {
        plan: PlanCreate;
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
    }>;
    update(input: {
        id: string;
        plan: PlanUpdate;
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
    } | undefined>;
    delete(input: {
        id: string;
    }): Promise<boolean>;
    getByEmpresa(input: {
        empresa: string;
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
//# sourceMappingURL=PlanController.d.ts.map