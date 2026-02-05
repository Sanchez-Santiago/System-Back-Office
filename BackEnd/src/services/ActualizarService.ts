import { EstadoCorreoModelDB } from "../interface/estadoCorreo.ts";
import { EstadoVentaModelDB } from "../interface/EstadoVenta.ts";
import { VentaModelDB } from "../interface/Venta.ts";

import { EstadoCorreoCreate } from "../schemas/correo/EstadoCorreo.ts";
import { EstadoVentaCreate } from "../schemas/venta/EstadoVenta.ts";
import { VentaCreate } from "../schemas/venta/Venta.ts";

export class ActualizarService {
  constructor(
    private estadoCorreoModelDB: EstadoCorreoModelDB,
    private estadoVentaModelDB: EstadoVentaModelDB,
    private ventaModelDB: VentaModelDB
  ) {}

  async actualizarEstadoCorreo(
    estadoNew: EstadoCorreoCreate,
  ): Promise<number> {
    if(!estadoNew) {
      return 0;
    }
    const estadoCorreoActual = await this.estadoCorreoModelDB
      .getLastBySAP({ sap: estadoNew.sap_id });
      
    if (estadoCorreoActual) {
      if(estadoCorreoActual.estado === "INICIAL"){
        await this.estadoCorreoModelDB.add({
          input: estadoNew,
        });
        return 1;
      }else if(estadoCorreoActual.usuario_id === "0000000000" && estadoNew.usuario_id === "0000000000"){
        if(estadoCorreoActual.estado === estadoNew.estado){
          return 0;
        }else if(estadoCorreoActual.estado !== estadoNew.estado){
          await this.estadoCorreoModelDB.add({
            input: estadoNew,
          });
          return 1;
        }
      }
    }
    return 0;
  }

  async actualizarEstadoVenta(
    estadoNew: EstadoVentaCreate,
  ): Promise<number> {
    if(!estadoNew) {
      return 0;
    }
    const estadoVentaActual = await this.estadoVentaModelDB
      .getLastByVentaId({ venta_id: estadoNew.venta_id });
      
    if (estadoVentaActual && estadoNew) {
      if(estadoVentaActual.estado === "PENDIENTE DE CARGA" || estadoVentaActual.estado === "CREADO DOCU OK"){
        await this.estadoVentaModelDB.add({
          input: estadoNew,
        });
        return 1;
      }else if(estadoVentaActual.usuario_id === "0000000000" && estadoNew.usuario_id === "0000000000"){
        if(estadoVentaActual.estado !== estadoNew.estado){
          await this.estadoVentaModelDB.add({
            input: estadoNew,
          });
          return 1;
        }
      }
    }
    return 0;
  }

  async actualizarSegumientoLinea(ventaNew: VentaCreate): Promise<number>{
    if(!ventaNew) {
      return 0;
    }
    const ventaActual = await this.ventaModelDB.getBySDS({ sds: ventaNew.sds });
    if(!ventaActual){
      await this.ventaModelDB.add({
        input: ventaNew,
      });
      return 1;
    } 
    return 0;
  }
  
}