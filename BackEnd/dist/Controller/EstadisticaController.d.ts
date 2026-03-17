import { EstadisticaService } from "../services/EstadisticaService.ts";
import { EstadisticaFilters } from "../interface/Estadistica.ts";
export declare class EstadisticaController {
    private service;
    constructor(service: EstadisticaService);
    getEstadisticas(filters: EstadisticaFilters): Promise<any>;
    getRecargas(filters: EstadisticaFilters): Promise<any>;
}
//# sourceMappingURL=EstadisticaController.d.ts.map