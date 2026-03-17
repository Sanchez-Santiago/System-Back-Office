import { PortabilidadService } from "../services/PortabilidadService.ts";
import { Portabilidad, PortabilidadCreate } from "../schemas/venta/Portabilidad.ts";
import { PortabilidadModelDB } from "../interface/Portabilidad.ts";
import { VentaService } from "../services/VentaService.ts";
import { VentaModelDB } from "../interface/venta.ts";
import { LineaNuevaService } from "../services/LineaNuevaService.ts";
import { LineaNuevaModelDB } from "../interface/LineaNueva.ts";
export declare class PortabilidadController {
    service: PortabilidadService;
    ventaService: VentaService;
    lineaNuevaService: LineaNuevaService;
    constructor(model: PortabilidadModelDB, ventaModel: VentaModelDB, lineaNuevaModel: LineaNuevaModelDB);
    getAll(params?: {
        page?: number;
        limit?: number;
    }): Promise<Portabilidad[]>;
    getById({ id }: {
        id: number;
    }): Promise<Portabilidad | undefined>;
    create({ portabilidad }: {
        portabilidad: PortabilidadCreate;
    }): Promise<Portabilidad>;
    update({ id, portabilidad }: {
        id: number;
        portabilidad: Partial<Portabilidad>;
    }): Promise<Portabilidad | undefined>;
    delete({ id }: {
        id: number;
    }): Promise<boolean>;
    getByVenta({ venta }: {
        venta: number;
    }): Promise<Portabilidad | undefined>;
    getStatistics(): Promise<{
        total: number;
        byEmpresaOrigen: Array<{
            empresa_origen: string;
            cantidad: number;
        }>;
        byMercadoOrigen: Array<{
            mercado_origen: string;
            cantidad: number;
        }>;
    }>;
    getByEstado({ estado }: {
        estado: string;
    }): Promise<Portabilidad[]>;
}
//# sourceMappingURL=PortabilidadController.d.ts.map