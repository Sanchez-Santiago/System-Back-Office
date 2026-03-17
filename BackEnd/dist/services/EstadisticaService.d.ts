import { EstadisticaPostgreSQL } from "../model/EstadisticaPostgreSQL.ts";
import { EstadisticaFilters, EstadisticaCompleta, RecargaDetallada } from "../interface/Estadistica.ts";
export declare class EstadisticaService {
    private model;
    constructor(model: EstadisticaPostgreSQL);
    getEstadisticas(filters: EstadisticaFilters): Promise<EstadisticaCompleta>;
    getRecargas(filters: EstadisticaFilters): Promise<RecargaDetallada>;
}
//# sourceMappingURL=EstadisticaService.d.ts.map