import { LineaNuevaService } from "../services/LineaNuevaService.ts";
import { LineaNueva, LineaNuevaCreate } from "../schemas/venta/LineaNueva.ts";
import { LineaNuevaModelDB } from "../interface/LineaNueva.ts";
import { VentaService } from "../services/VentaService.ts";
import { VentaModelDB } from "../interface/venta.ts";
import { PortabilidadService } from "../services/PortabilidadService.ts";
import { PortabilidadModelDB } from "../interface/Portabilidad.ts";
export declare class LineaNuevaController {
    service: LineaNuevaService;
    ventaService: VentaService;
    portabilidadService: PortabilidadService;
    constructor(model: LineaNuevaModelDB, ventaModel: VentaModelDB, portabilidadModel: PortabilidadModelDB);
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
//# sourceMappingURL=LineaNuevaController.d.ts.map