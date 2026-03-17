import { EstadoCorreoModelDB } from "../interface/estadoCorreo.ts";
import { EstadoVentaModelDB } from "../interface/EstadoVenta.ts";
import { VentaModelDB } from "../interface/venta.ts";
import { EstadoCorreoCreate } from "../schemas/correo/EstadoCorreo.ts";
import { EstadoVentaCreate } from "../schemas/venta/EstadoVenta.ts";
import { VentaCreate } from "../schemas/venta/Venta.ts";
export declare class ActualizarService {
    private estadoCorreoModelDB;
    private estadoVentaModelDB;
    private ventaModelDB;
    constructor(estadoCorreoModelDB: EstadoCorreoModelDB, estadoVentaModelDB: EstadoVentaModelDB, ventaModelDB: VentaModelDB);
    actualizarEstadoCorreo(estadoNew: EstadoCorreoCreate): Promise<number>;
    actualizarEstadoVenta(estadoNew: EstadoVentaCreate): Promise<number>;
    actualizarSegumientoLinea(ventaNew: VentaCreate): Promise<number>;
}
//# sourceMappingURL=ActualizarService.d.ts.map