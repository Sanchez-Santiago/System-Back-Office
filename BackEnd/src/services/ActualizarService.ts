import { EstadoCorreoModelDB } from "../interface/estadoCorreo.ts";
import { EstadoVentaModelDB } from "../interface/EstadoVenta.ts";
import {
  EstadoCorreo,
  EstadoCorreoCreate,
} from "../schemas/correo/EstadoCorreo.ts";

export class ActualizarService {
  constructor(
    private estadoCorreoModelDB: EstadoCorreoModelDB,
    private estadoVentaModelDB: EstadoVentaModelDB,
  ) {}

  async actualizarEstadoCorreo(
    sap: string,
    estadoNew: EstadoCorreoCreate,
  ): Promise<EstadoCorreoModelDB> {
    const estadoCorreoActual = await this.estadoCorreoModelDB
      .getLastBySAP({ sap });
    if (estadoCorreoActual) {
      if (estadoCorreoActual.estado === estadoNew.estado) {
        return estadoCorreoActual;
      }
    }

    const estadoCorreoNew = await this.estadoCorreoModelDB.add({
      input: estadoNew,
    });
    return estadoCorreoNew;
  }

  async actualizarEstadoVenta(
    id: number,
    estado: string,
  ): Promise<EstadoVentaModelDB> {
    const estadoVenta = await EstadoVentaModelDB.findByPk(id);
    if (!estadoVenta) throw new Error("EstadoVenta no encontrado");
    estadoVenta.estado = estado;
    await estadoVenta.save();
    return estadoVenta;
  }
}
