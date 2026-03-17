import { PromocionModelDB } from "../interface/Promocion.ts";
import { PromocionCreate, PromocionUpdate } from "../schemas/venta/Promocion.ts";
export declare class PromocionService {
    private modePromocion;
    constructor(modePromocion: PromocionModelDB);
    getAll(params?: {
        page?: number;
        limit?: number;
    }): Promise<{
        nombre: string;
        fecha_creacion: Date;
        promocion_id: number;
        empresa_origen_id: number;
        activo: boolean;
        descuento: number;
        beneficios?: string | undefined;
        fecha_terminacion?: Date | null | undefined;
    }[] | undefined>;
    getById(id: string): Promise<{
        nombre: string;
        fecha_creacion: Date;
        promocion_id: number;
        empresa_origen_id: number;
        activo: boolean;
        descuento: number;
        beneficios?: string | undefined;
        fecha_terminacion?: Date | null | undefined;
    } | undefined>;
    getByEmpresa(empresa: string): Promise<{
        nombre: string;
        fecha_creacion: Date;
        promocion_id: number;
        empresa_origen_id: number;
        activo: boolean;
        descuento: number;
        beneficios?: string | undefined;
        fecha_terminacion?: Date | null | undefined;
    }[]>;
    create(input: PromocionCreate): Promise<{
        nombre: string;
        fecha_creacion: Date;
        promocion_id: number;
        empresa_origen_id: number;
        activo: boolean;
        descuento: number;
        beneficios?: string | undefined;
        fecha_terminacion?: Date | null | undefined;
    }>;
    update(id: string, input: PromocionUpdate): Promise<{
        nombre: string;
        fecha_creacion: Date;
        promocion_id: number;
        empresa_origen_id: number;
        activo: boolean;
        descuento: number;
        beneficios?: string | undefined;
        fecha_terminacion?: Date | null | undefined;
    } | undefined>;
    delete(id: string): Promise<boolean>;
}
//# sourceMappingURL=PromocionService.d.ts.map