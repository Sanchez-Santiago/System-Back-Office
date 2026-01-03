// ============================================
// BackEnd/src/interface/estadoCorreo.ts
// ============================================
import { EstadoCorreo } from "../schemas/correo/EstadoCorreo.ts";
import { ModelDB } from "./model.ts";

export interface EstadoCorreoModelDB extends ModelDB<EstadoCorreo> {
  /**
   * Obtiene el estado de un correo por su SAP ID
   */
  getBySAP: ({ sap }: { sap: string }) => Promise<EstadoCorreo[] | undefined>;

  /**
   * Obtiene el último estado de un correo por su SAP ID
   */
  getLastBySAP: ({ sap }: { sap: string }) => Promise<EstadoCorreo | undefined>;

  /**
   * Obtiene todos los correos entregados
   */
  getEntregados: () => Promise<EstadoCorreo[]>;

  /**
   * Obtiene todos los correos no entregados
   */
  getNoEntregados: () => Promise<EstadoCorreo[]>;

  /**
   * Obtiene todos los correos devueltos
   */
  getDevueltos: () => Promise<EstadoCorreo[]>;

  /**
   * Obtiene estados por rango de fechas
   */
  getByFechaRango: (params: {
    fechaInicio: Date;
    fechaFin: Date;
  }) => Promise<EstadoCorreo[]>;

  /**
   * Obtiene estados por ubicación actual
   */
  getByUbicacion: ({ ubicacion }: { ubicacion: string }) => Promise<
    EstadoCorreo[]
  >;

  /**
   * Marca un correo como entregado
   */
  marcarComoEntregado: ({ id }: { id: string }) => Promise<
    EstadoCorreo | undefined
  >;

  /**
   * Actualiza la ubicación actual de un correo
   */
  actualizarUbicacion: (params: {
    id: string;
    ubicacion: string;
  }) => Promise<EstadoCorreo | undefined>;
}
