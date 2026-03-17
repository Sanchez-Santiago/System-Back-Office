import { EmpresaModelDB, Empresa, EmpresaCreate } from "../interface/Empresa.ts";
export declare class EmpresaService {
    private modeEmpresa;
    constructor(modeEmpresa: EmpresaModelDB);
    getAll(params?: {
        page?: number;
        limit?: number;
        search?: string;
    }): Promise<Empresa[]>;
    getById(id: string): Promise<Empresa | undefined>;
    create(input: EmpresaCreate): Promise<Empresa>;
    update(id: string, input: Partial<Empresa>): Promise<Empresa | undefined>;
    delete(id: string): Promise<boolean>;
}
//# sourceMappingURL=EmpresaService.d.ts.map