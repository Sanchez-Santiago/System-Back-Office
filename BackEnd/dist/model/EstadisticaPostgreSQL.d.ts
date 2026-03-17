import { PostgresClient } from "../database/PostgreSQL.ts";
import { EstadisticaFilters, RecargaDetallada, EstadisticaCompleta } from "../interface/Estadistica.ts";
export declare class EstadisticaPostgreSQL {
    connection: PostgresClient;
    constructor(connection: PostgresClient);
    private getFechaInicio;
    /**
     * Construye el WHERE base (fecha_creacion, vendedor, celula) y por separado
     * las condiciones de portación (p.fecha_portacion).
     *
     * Las condiciones de portación SOLO deben concatenarse en queries que
     * incluyan `LEFT JOIN portabilidad p`. Mezclarlas en el WHERE base causaba
     * el error "missing FROM-clause entry for table p" en queries sin ese JOIN.
     */
    private buildWhereClause;
    getEstadisticas(filters: EstadisticaFilters): Promise<EstadisticaCompleta>;
    getRecargasDetalladas(filters: EstadisticaFilters): Promise<RecargaDetallada>;
}
//# sourceMappingURL=EstadisticaPostgreSQL.d.ts.map