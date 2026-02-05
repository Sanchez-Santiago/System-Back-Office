import { EstadoCorreoModelDB } from "../interface/estadoCorreo.ts";
import { EstadoVentaModelDB } from "../interface/EstadoVenta.ts";
import { EstadoCorreoCreate } from "../schemas/correo/EstadoCorreo.ts";
import {
  EstadoVentaCreate,
  EstadoVentaEstado,
} from "../schemas/venta/EstadoVenta.ts";
import { VentaModelDB } from "../interface/venta.ts";
import { CorreoModelDB } from "../interface/correo.ts";

import { ActualizarService } from "../services/ActualizarService.ts";

export class ActualizarController {
  constructor(
    private estadoCorreoModelDB: EstadoCorreoModelDB,
    private estadoVentaModelDB: EstadoVentaModelDB,
    private ventaModelDB: VentaModelDB,
    private correoModelDB: CorreoModelDB,
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
        console.log("Guia encontrada");
        numeroDeGuiaSAP = i;
      }
      if (estadoNew[0][i] === "Estado Guia") {
        console.log("Estado encontrada");
        numeroDeEstadoSAP = i;
      }
      if (estadoNew[0][i] === "Ultimo Evento Nombre") {
        console.log("Descripcion encontrada");
        numeroDeDescripcionSAP = i;
      }
      if (estadoNew[0][i] === "Ubicacion") {
        console.log("Ubicacion encontrada");
        numeroDeUbicacionSAP = i;
      }
    }

    if (Guia) {
      numeroDeGuiaSAP = Guia;
    }
    if (Estado) {
      numeroDeEstadoSAP = Estado;
    }
    if (Descripcion) {
      numeroDeDescripcionSAP = Descripcion;
    }
    if (Ubicacion) {
      numeroDeUbicacionSAP = Ubicacion;
    }

    const todosLosEstados = await this.correoModelDB.getAll({
      page: 1,
      limit: 100000,
    });

    if (!todosLosEstados || todosLosEstados.length === 0) {
      return 0;
    }

    for (const estado of estadoNew.slice(1)) {
      for (const correo of todosLosEstados) {
        if (correo.sap_id === estado[numeroDeGuiaSAP]) {
          /*console.log(
            `Estado: ${estado[numeroDeEstadoSAP]}, Descripcion: ${
              estado[numeroDeDescripcionSAP]
            }, Ubicacion: ${estado[numeroDeUbicacionSAP]}`,
          );*/
          const estadoCorreoCreate: EstadoCorreoCreate = {
            sap_id: estado[numeroDeGuiaSAP],
            estado: estado[numeroDeEstadoSAP] as
              | "INICIAL"
              | "ASIGNADO"
              | "DEVUELTO AL CLIENTE"
              | "EN DEVOLUCION"
              | "EN TRANSITO"
              | "ENTREGADO"
              | "INGRESADO CENTRO LOGISTICO - ECOMMERCE"
              | "INGRESADO EN AGENCIA"
              | "INGRESADO PICK UP CENTER UES"
              | "NO ENTREGADO"
              | "PIEZA EXTRAVIADA"
              | "RENDIDO AL CLIENTE",
            descripcion: estado[numeroDeDescripcionSAP],
            usuario_id: "0219c4f7-a760-4365-99e2-20929b47fe99",
            ubicacion_actual: estado[numeroDeUbicacionSAP],
          };
          count += await this.actualizarService.actualizarEstadoCorreo(
            estadoCorreoCreate,
          );
        }
      }
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
    // DEBUG: Descomentar para debugging
    // console.log("=== INICIO actualizarEstadoVenta ===");
    // console.log("Total de filas recibidas:", estadoNew.length);
    // console.log("Headers:", estadoNew[0]);

    let numeroDeVentaSDS: number = -1;
    let numeroDeEstado: number = -1;
    let numeroDeDescripcion: number = -1;

    for (let i = 0; i < estadoNew[0].length; i++) {
      const header = estadoNew[0][i].trim();
      // DEBUG: Descomentar para debugging
      // console.log(`Header[${i}]: "${header}"`);
      if (header === "SDS") {
        // console.log("✓ SDS encontrada en posición", i);
        numeroDeVentaSDS = i;
      }
      if (header === "DESCRIPCION ESTADO") {
        // console.log("✓ DESCRIPCION ESTADO encontrada en posición", i);
        numeroDeEstado = i;
      }
      if (header === "DESCRIPCION RECHAZOS") {
        // console.log("✓ DESCRIPCION RECHAZOS encontrada en posición", i);
        numeroDeDescripcion = i;
      }
    }

    // Validar que se encontraron todos los headers necesarios
    if (numeroDeVentaSDS === -1) {
      console.error("✗ ERROR: No se encontró columna 'SDS'");
      return 0;
    }
    if (numeroDeEstado === -1) {
      console.error("✗ ERROR: No se encontró columna 'DESCRIPCION ESTADO'");
      return 0;
    }

    // DEBUG: Descomentar para debugging
    // console.log(
    //   "Índices encontrados - SDS:",
    //   numeroDeVentaSDS,
    //   "Estado:",
    //   numeroDeEstado,
    //   "Descripcion:",
    //   numeroDeDescripcion,
    // );

    if (VentaSDS !== undefined) numeroDeVentaSDS = VentaSDS;
    if (Estado !== undefined) numeroDeEstado = Estado;
    if (Descripcion !== undefined) numeroDeDescripcion = Descripcion;

    const todosLosEstadosActuales = await this.ventaModelDB.getAll({
      page: 1,
      limit: 100000,
    });
    // ✅ Validación agregada
    if (!todosLosEstadosActuales || todosLosEstadosActuales.length === 0) {
      console.error("✗ ERROR: No se encontraron ventas");
      return 0;
    }

    let ventaActual;
    for (const estado of estadoNew.slice(1)) {
      for (const venta of todosLosEstadosActuales) {
        if (venta.sds === estado[numeroDeVentaSDS]) {
          ventaActual = venta;
        }
      }
      if (ventaActual) {
        //console.log(ventaActual, "Nuevo Estado:", estado[numeroDeEstado]);
        if (estado[numeroDeEstado] === undefined) {
          console.error("✗ ERROR: Estado nuevo no definido");
          continue;
        }

        const estadoVentaCreate: EstadoVentaCreate = {
          venta_id: ventaActual.venta_id,
          estado: estado[numeroDeEstado] as
            | "PENDIENTE DE CARGA"
            | "CREADO SIN DOCU"
            | "CREADO DOCU OK"
            | "EN TRANSPORTE"
            | "ENTREGADO"
            | "REPACTAR"
            | "ACTIVADO NRO CLARO"
            | "ACTIVADO NRO PORTADO"
            | "AGENDADO"
            | "APROBADO ABD"
            | "CANCELADO"
            | "CREADO"
            | "EVALUANDO DONANTE"
            | "PENDIENTE CARGA PIN"
            | "PIN INGRESADO"
            | "RECHAZADO ABD"
            | "RECHAZADO DONANTE"
            | "SPN CANCELADA",
          descripcion: estado[numeroDeDescripcion] || "",
          usuario_id: "0219c4f7-a760-4365-99e2-20929b47fe99",
          fecha_creacion: new Date(),
        };
        // DEBUG: Descomentar para debugging
        // console.log("EstadoVentaCreate:", estadoVentaCreate);
        const result = await this.actualizarService.actualizarEstadoVenta(
          estadoVentaCreate,
        );
        // DEBUG: Descomentar para debugging
        // console.log("Resultado de actualizarEstadoVenta:", result);
        count += result;
      } else {
        // DEBUG: Descomentar para debugging
        // console.log("Venta no encontrada:", estado[numeroDeVentaSDS]);
      }

      console.log("Count acumulado:", count);
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
