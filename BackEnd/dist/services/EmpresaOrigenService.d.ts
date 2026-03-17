import { EmpresaOrigenModelDB, EmpresaOrigen, EmpresaOrigenCreate } from "../interface/EmpresaOrigen.ts";
export declare class EmpresaOrigenService {
    private modeEmpresaOrigen;
    constructor(modeEmpresaOrigen: EmpresaOrigenModelDB);
    getAll(params?: {
        page?: number;
        limit?: number;
        search?: string;
    }): Promise<EmpresaOrigen[]>;
    getById(id: string): Promise<EmpresaOrigen | undefined>;
    create(input: EmpresaOrigenCreate): Promise<EmpresaOrigen>;
    update(id: string, input: Partial<EmpresaOrigen>): Promise<EmpresaOrigen | undefined>;
    delete(id: string): Promise<boolean>;
}
//# sourceMappingURL=EmpresaOrigenService.d.ts.map