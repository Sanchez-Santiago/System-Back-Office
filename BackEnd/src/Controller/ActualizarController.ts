
import { EstadoCorreoModelDB } from "../interface/estadoCorreo.ts";
import { EstadoVentaModelDB } from "../interface/EstadoVenta.ts";
import { EstadoCorreoCreate } from "../schemas/correo/EstadoCorreo.ts";
import { EstadoVentaCreate, EstadoVentaEstado } from "../schemas/venta/EstadoVenta.ts";
import { VentaModelDB } from "../interface/Venta.ts";

import { ActualizarService } from "../services/ActualizarService.ts";

export class ActualizarController {
    constructor(
    private estadoCorreoModelDB: EstadoCorreoModelDB,
    private estadoVentaModelDB: EstadoVentaModelDB,
    private ventaModelDB: VentaModelDB,
    private actualizarService: ActualizarService,
  ) {}


  async actualizarEstadoCorreo(
    estadoNew: string[][],
    Guia?: number,
    Estado?: number,
    Descripcion?: number,
    Ubicacion?: number,
  ): Promise<number> {
    let count = 0;

    let numeroDeGuiaSAP: number = 0;
    let numeroDeEstadoSAP: number = 0;
    let numeroDeDescripcionSAP: number = 0;
    let numeroDeUbicacionSAP: number = 0;

    for (let i = 0; i < estadoNew[0].length; i++) {
     if (estadoNew[0][i] === "Guia") {
      numeroDeGuiaSAP = i;
     }
     if (estadoNew[0][i] === "Estado Guia") {
      numeroDeEstadoSAP = i;
     }
     if (estadoNew[0][i] === "Ultimo Evento Nombre") {
      numeroDeDescripcionSAP = i;
     }
     if (estadoNew[0][i] === "Ubicacion") {
      numeroDeUbicacionSAP = i;
     }
    }

    if(Guia){
      numeroDeGuiaSAP = Guia;
    }
    if(Estado){
      numeroDeEstadoSAP = Estado;
    }
    if(Descripcion){
      numeroDeDescripcionSAP = Descripcion;
    }
    if(Ubicacion){
      numeroDeUbicacionSAP = Ubicacion;
    }

    for (const estado of estadoNew.slice(1)) {
      const estadoCorreoCreate: EstadoCorreoCreate = {
        sap_id: estado[numeroDeGuiaSAP],
        estado: estado[numeroDeEstadoSAP] as "INICIAL" | "ASIGNADO" | "DEVUELTO AL CLIENTE" | "EN DEVOLUCION" | "EN TRANSITO" | "ENTREGADO" | "INGRESADO CENTRO LOGISTICO - ECOMMERCE" | "INGRESADO EN AGENCIA" | "INGRESADO PICK UP CENTER UES" | "NO ENTREGADO" | "PIEZA EXTRAVIADA" | "RENDIDO AL CLIENTE",
        descripcion: estado[numeroDeDescripcionSAP],
        usuario_id: "0000000000",
        ubicacion_actual: estado[numeroDeUbicacionSAP],
      };
      count += await this.actualizarService.actualizarEstadoCorreo(estadoCorreoCreate);
    }
    
    return count;
  }


  async actualizarEstadoVenta(
    estadoNew: string[][],
    VentaSDS?: number,
    Estado?: number,
    Descripcion?: number,
  ): Promise<number> {
    let count = 0;
    
    let numeroDeVentaSDS: number = 0;
    let numeroDeEstado: number = 0;
    let numeroDeDescripcion: number = 0;

    for (let i = 0; i < estadoNew[0].length; i++) {
      const header = estadoNew[0][i].trim();
      if (header === "SDS") {
        numeroDeVentaSDS = i;
      }
      if (header === "DESCRIPCION ESTADO") {
        numeroDeEstado = i;
      }
      if (header === "DESCRIPCION RECHAZOS") {
        numeroDeDescripcion = i;
      }
    }

    if(VentaSDS !== undefined) numeroDeVentaSDS = VentaSDS;
    if(Estado !== undefined) numeroDeEstado = Estado;
    if(Descripcion !== undefined) numeroDeDescripcion = Descripcion;

    for (const estado of estadoNew.slice(1)) {
      const venta = await this.ventaModelDB.getBySDS({ sds: estado[numeroDeVentaSDS] });
      if(!venta){
        return 0;
      }
      const estadoVentaCreate: EstadoVentaCreate = {
        venta_id: Number(venta.vendedor_id),
        estado: estado[numeroDeEstado] as EstadoVentaEstado, // Typed cast to satisfy lint
        descripcion: estado[numeroDeDescripcion],
        usuario_id: "0000000000",
        fecha_creacion: new Date(),
      };
      count += await this.actualizarService.actualizarEstadoVenta(estadoVentaCreate);
    }
    return count;
  }


  
  /*
  async actualizarSegumientoLinea(
    ventaNew: string[][],
    VentaId?: number,
    Estado?: number,
    Descripcion?: number,
  ): Promise<number> {
    let count = 0;
    
    let numeroDeVentaSAP: number = 0;
    let numeroDeEstadoSAP: number = 0;
    let numeroDeDescripcionSAP: number = 0;

    for (let i = 0; i < ventaNew[0].length; i++) {
      const header = ventaNew[0][i].trim();
      if (header === "Venta ID") {
        numeroDeVentaSAP = i;
      }
      if (header === "Estado Venta") {
        numeroDeEstadoSAP = i;
      }
      if (header === "Observacion" || header === "Descripcion") {
        numeroDeDescripcionSAP = i;
      }
    }

    if (VentaId !== undefined) numeroDeVentaSAP = VentaId;
    if (Estado !== undefined) numeroDeEstadoSAP = Estado;
    if (Descripcion !== undefined) numeroDeDescripcionSAP = Descripcion;

    for (const venta of ventaNew.slice(1)) {
      const ventaCreate: VentaCreate = {
        venta_id: Number(venta[numeroDeVentaSAP]),
        estado: venta[numeroDeEstadoSAP] as EstadoVentaEstado, // Typed cast to satisfy lint
        descripcion: venta[numeroDeDescripcionSAP],
        usuario_id: "0000000000",
        fecha_creacion: new Date(),
      };
      count += await this.actualizarService.actualizarSegumientoLinea(ventaCreate);
    }
    return count;
  }
  */
}