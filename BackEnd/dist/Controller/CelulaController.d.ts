import { CelulaCreate, CelulaUpdate } from "../schemas/venta/Celula.ts";
import { CelulaService } from "../services/CelulaService.ts";
export declare class CelulaController {
    private celulaService;
    constructor(celulaService: CelulaService);
    getAll(input: {
        page?: number;
        limit?: number;
    }): Promise<import("../interface/Celula.js").Celula[]>;
    getById(input: {
        id: number;
    }): Promise<import("../interface/Celula.js").Celula | undefined>;
    getByEmpresa(input: {
        empresa: number;
    }): Promise<import("../interface/Celula.js").Celula[]>;
    getAsesoresByCelula(input: {
        id_celula: number;
    }): Promise<any[]>;
    create(input: {
        celula: CelulaCreate;
    }): Promise<import("../interface/Celula.js").Celula>;
    update(input: {
        id: number;
        celula: CelulaUpdate;
    }): Promise<import("../interface/Celula.js").Celula | undefined>;
    delete(input: {
        id: number;
    }): Promise<boolean>;
}
//# sourceMappingURL=CelulaController.d.ts.map