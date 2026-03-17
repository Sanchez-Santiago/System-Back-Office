import { EmpresaOrigenService } from "../services/EmpresaOrigenService.ts";
import { EmpresaOrigenCreate, EmpresaOrigen } from "../interface/EmpresaOrigen.ts";
export declare class EmpresaOrigenController {
    private empresaOrigenService;
    constructor(empresaOrigenService: EmpresaOrigenService);
    getAll(params: {
        page?: number;
        limit?: number;
        search?: string;
    }): Promise<EmpresaOrigen[]>;
    getById(id: string): Promise<EmpresaOrigen | undefined>;
    create(input: EmpresaOrigenCreate): Promise<EmpresaOrigen>;
    update(id: string, input: Partial<EmpresaOrigen>): Promise<EmpresaOrigen | undefined>;
    delete(id: string): Promise<boolean>;
}
//# sourceMappingURL=EmpresaOrigenController.d.ts.map