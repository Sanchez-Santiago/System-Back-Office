import { EstadoCorreoModelDB } from "../interface/estadoCorreo.ts";
import { EstadoVentaModelDB } from "../interface/EstadoVenta.ts";
import { VentaModelDB } from "../interface/venta.ts";
import { CorreoModelDB } from "../interface/correo.ts";
import { ActualizarService } from "../services/ActualizarService.ts";
export declare class ActualizarController {
    private estadoCorreoModelDB;
    private estadoVentaModelDB;
    private ventaModelDB;
    private correoModelDB;
    private actualizarService;
    constructor(estadoCorreoModelDB: EstadoCorreoModelDB, estadoVentaModelDB: EstadoVentaModelDB, ventaModelDB: VentaModelDB, correoModelDB: CorreoModelDB, actualizarService: ActualizarService);
    actualizarEstadoCorreo(estadoNew: string[][], Guia?: number, Estado?: number, Descripcion?: number, Ubicacion?: number): Promise<number>;
    actualizarEstadoVenta(estadoNew: string[][], VentaSDS?: number, Estado?: number, Descripcion?: number): Promise<number>;
    actualizarSegumientoLinea(ventaNew: string[][], documento?: number, fechaNacimiento?: number, promo?: number, planID?: number, pedidoSTL?: number, numeroDeContacto?: number, pedidoSAP?: number, ultimoStatus?: number, operadoraPortacion?: number, esnProMark?: number, exaUsuario?: number): Promise<number>;
}
//# sourceMappingURL=ActualizarController.d.ts.map