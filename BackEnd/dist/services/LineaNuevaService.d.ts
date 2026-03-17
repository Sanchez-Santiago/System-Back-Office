import { LineaNuevaModelDB } from "../interface/LineaNueva.ts";
import { LineaNueva, LineaNuevaCreate } from "../schemas/venta/LineaNueva.ts";
export declare class LineaNuevaService {
    model: LineaNuevaModelDB;
    constructor(model: LineaNuevaModelDB);
    getAll(params?: {
        page?: number;
        limit?: number;
    }): Promise<LineaNueva[]>;
    getById({ id }: {
        id: number;
    }): Promise<LineaNueva | undefined>;
    create({ lineaNueva }: {
        lineaNueva: LineaNuevaCreate;
    }): Promise<LineaNueva>;
    update({ id, lineaNueva }: {
        id: number;
        lineaNueva: Partial<LineaNueva>;
    }): Promise<LineaNueva | undefined>;
    delete({ id }: {
        id: number;
    }): Promise<boolean>;
    getByVenta({ venta }: {
        venta: number;
    }): Promise<LineaNueva | undefined>;
    getStatistics(): Promise<{
        total: number;
    }>;
    getByEstado({ estado }: {
        estado: string;
    }): Promise<LineaNueva[]>;
}
//# sourceMappingURL=LineaNuevaService.d.ts.map