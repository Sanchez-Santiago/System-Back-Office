import 'dotenv/config';
import { CorreoModelDB } from "../interface/correo.ts";
import { Correo, CorreoCreate, CorreoUpdate } from "../schemas/correo/Correo.ts";
export declare class CorreoController {
    private service;
    constructor(model: CorreoModelDB);
    getAll(params: {
        page?: number;
        limit?: number;
        name?: string;
    }): Promise<Correo[]>;
    getById({ id }: {
        id: string;
    }): Promise<Correo>;
    getBySAP({ sap }: {
        sap: string;
    }): Promise<Correo>;
    create(input: CorreoCreate): Promise<Correo>;
    update(params: {
        id: string;
        input: Partial<CorreoUpdate>;
    }): Promise<Correo>;
    delete({ id }: {
        id: string;
    }): Promise<void>;
    getByLocalidad({ localidad }: {
        localidad: string;
    }): Promise<Correo[]>;
    getByDepartamento({ departamento }: {
        departamento: string;
    }): Promise<Correo[]>;
    getProximosAVencer({ dias }?: {
        dias?: number;
    }): Promise<Correo[]>;
    getVencidos(): Promise<Correo[]>;
    getStats(): Promise<{
        total: number;
        porLocalidad: Record<string, number>;
        porDepartamento: Record<string, number>;
        proximosAVencer: number;
        vencidos: number;
    }>;
}
//# sourceMappingURL=CorreoController.d.ts.map