import { VentaModelDB } from "../interface/venta.ts";
import { UserModelDB } from "../interface/Usuario.ts";
import { ClienteModelDB } from "../interface/Cliente.ts";
import { CorreoModelDB } from "../interface/correo.ts";
import { PortabilidadModelDB } from "../interface/Portabilidad.ts";
import { LineaNuevaModelDB } from "../interface/LineaNueva.ts";
import { PlanModelDB } from "../interface/Plan.ts";
import { PromocionModelDB } from "../interface/Promocion.ts";
import { EstadoVentaModelDB } from "../interface/EstadoVenta.ts";
export declare function ventaRouter(ventaModel: VentaModelDB, userModel: UserModelDB, correoModel: CorreoModelDB, lineaNuevaModel: LineaNuevaModelDB, portabilidadModel: PortabilidadModelDB, clienteModel: ClienteModelDB, planModel: PlanModelDB, promocionModel: PromocionModelDB, estadoVentaModel: EstadoVentaModelDB): import("express-serve-static-core").Router;
//# sourceMappingURL=VentaRouter.d.ts.map