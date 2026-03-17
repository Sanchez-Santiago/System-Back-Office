import { PromocionCreate, PromocionUpdate } from "../schemas/venta/Promocion.ts";
import { PromocionService } from "../services/PromocionService.ts";
export declare class PromocionController {
    private promocionService;
    constructor(promocionService: PromocionService);
    getAll(input: {
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
    getById(input: {
        id: string;
    }): Promise<{
        nombre: string;
        fecha_creacion: Date;
        promocion_id: number;
        empresa_origen_id: number;
        activo: boolean;
        descuento: number;
        beneficios?: string | undefined;
        fecha_terminacion?: Date | null | undefined;
    } | undefined>;
    getByEmpresa(input: {
        empresa: string;
    }): Promise<{
        nombre: string;
        fecha_creacion: Date;
        promocion_id: number;
        empresa_origen_id: number;
        activo: boolean;
        descuento: number;
        beneficios?: string | undefined;
        fecha_terminacion?: Date | null | undefined;
    }[]>;
    create(input: {
        promocion: PromocionCreate;
    }): Promise<{
        nombre: string;
        fecha_creacion: Date;
        promocion_id: number;
        empresa_origen_id: number;
        activo: boolean;
        descuento: number;
        beneficios?: string | undefined;
        fecha_terminacion?: Date | null | undefined;
    }>;
    update(input: {
        id: string;
        promocion: PromocionUpdate;
    }): Promise<{
        nombre: string;
        fecha_creacion: Date;
        promocion_id: number;
        empresa_origen_id: number;
        activo: boolean;
        descuento: number;
        beneficios?: string | undefined;
        fecha_terminacion?: Date | null | undefined;
    } | undefined>;
    delete(input: {
        id: string;
    }): Promise<boolean>;
}
//# sourceMappingURL=PromocionController.d.ts.map