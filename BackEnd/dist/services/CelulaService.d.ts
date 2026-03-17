import { CelulaModelDB } from "../interface/Celula.ts";
import { CelulaCreate, CelulaUpdate } from "../schemas/venta/Celula.ts";
export declare class CelulaService {
    private celulaModel;
    constructor(celulaModel: CelulaModelDB);
    getAll(params?: {
        page?: number;
        limit?: number;
    }): Promise<import("../interface/Celula.ts").Celula[]>;
    getById(id: number): Promise<import("../interface/Celula.ts").Celula | undefined>;
    getByEmpresa(empresa: number): Promise<import("../interface/Celula.ts").Celula[]>;
    getAsesoresByCelula(id_celula: number): Promise<any[]>;
    create(input: CelulaCreate): Promise<import("../interface/Celula.ts").Celula>;
    update(id: number, input: CelulaUpdate): Promise<import("../interface/Celula.ts").Celula | undefined>;
    delete(id: number): Promise<boolean>;
}
//# sourceMappingURL=CelulaService.d.ts.map