import { EmpresaService } from "../services/EmpresaService.ts";
import { EmpresaCreate, Empresa } from "../interface/Empresa.ts";
export declare class EmpresaController {
    private empresaService;
    constructor(empresaService: EmpresaService);
    getAll(params: {
        page?: number;
        limit?: number;
        search?: string;
    }): Promise<Empresa[]>;
    getById(id: string): Promise<Empresa | undefined>;
    create(input: EmpresaCreate): Promise<Empresa>;
    update(id: string, input: Partial<Empresa>): Promise<Empresa | undefined>;
    delete(id: string): Promise<boolean>;
}
//# sourceMappingURL=EmpresaController.d.ts.map