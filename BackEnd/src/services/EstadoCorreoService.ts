// ============================================
// BackEnd/src/services/EstadoCorreoService.ts
// ============================================
import { EstadoCorreoModelDB } from "../interface/estadoCorreo.ts";
import {
  EstadoCorreo,
  EstadoCorreoCreate,
  EstadoCorreoCreateSchema,
  EstadoCorreoUpdate,
} from "../schemas/correo/EstadoCorreo.ts";

/**
 * Servicio de Estado de Correo
 * Gestiona la lógica de negocio para el tracking de correos
 */
export class EstadoCorreoService {
  private model: EstadoCorreoModelDB;

  constructor(model: EstadoCorreoModelDB) {
    this.model = model;
  }

  /**
   * Obtiene todos los estados con paginación
   * Solo muestra el ÚLTIMO estado de cada correo (sin duplicados)
   */
  async getAll(params: {
    page?: number;
    limit?: number;
  }): Promise<EstadoCorreo[] | undefined> {
    try {
      const page = params.page || 1;
      const limit = params.limit || 10;

      if (page < 1 || limit < 1) {
        throw new Error("Los valores de paginación deben ser mayores a 0");
      }

      if (limit > 100) {
        throw new Error("El límite máximo es 100 estados por página");
      }

      console.log(
        `[INFO] Obteniendo estados (último por SAP) - Página: ${page}, Límite: ${limit}`,
      );

      const estados = await this.model.getAll(params);

      if (!estados || estados.length === 0) {
        return undefined;
      }

      console.log(`[INFO] ${estados.length} estados encontrados`);
      return estados;
    } catch (error) {
      console.error("[ERROR] EstadoCorreoService.getAll:", error);
      throw new Error(
        `Error al obtener estados: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
      );
    }
  }

  /**
   * Obtiene un estado por ID
   */
  async getById({ id }: { id: string }): Promise<EstadoCorreo | undefined> {
    try {
      if (!id || id.trim() === "") {
        throw new Error("ID de estado requerido");
      }

      console.log(`[INFO] Buscando estado por ID: ${id}`);
      const estado = await this.model.getById({ id });

      if (!estado) {
        return undefined;
      }

      console.log(`[INFO] Estado encontrado: ${estado.estado_correo_id}`);
      return estado;
    } catch (error) {
      console.error("[ERROR] EstadoCorreoService.getById:", error);
      throw new Error(
        `Error al obtener estado por ID: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
      );
    }
  }

  /**
   * Obtiene TODO el historial de estados de un correo por SAP
   */
  async getBySAP({ sap }: { sap: string }): Promise<EstadoCorreo[]> {
    try {
      if (!sap || sap.trim() === "") {
        throw new Error("Código SAP requerido");
      }

      console.log(`[INFO] Buscando historial completo por SAP: ${sap}`);
      const estados = await this.model.getBySAP({ sap });

      if (!estados || estados.length === 0) {
        console.log(`[WARN] No se encontraron estados para SAP: ${sap}`);
        return [];
      }

      console.log(
        `[INFO] ${estados.length} estados encontrados para SAP: ${sap}`,
      );
      return estados;
    } catch (error) {
      console.error("[ERROR] EstadoCorreoService.getBySAP:", error);
      throw new Error(
        `Error al obtener historial por SAP: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
      );
    }
  }

  async getLastBySAP({ sap }: { sap: string }): Promise<EstadoCorreo[]> {
    const estados = await this.model.getLastBySAP({ sap });
    if (!estados || estados.length === 0) {
      console.log(`[WARN] No se encontraron estados para SAP: ${sap}`);
      return [];
    }
    console.log(
      `[INFO] ${estados.length} estados encontrados para SAP: ${sap}`,
    );
    return estados;
  }

  /**
   * Crea un nuevo estado de correo
   */
  async create(input: EstadoCorreoCreate): Promise<EstadoCorreo> {
    try {
      if (!input || Object.keys(input).length === 0) {
        throw new Error("Datos de estado requeridos");
      }

      console.log(`[INFO] Creando estado para SAP: ${input.sap_id}`);

      // Validar con Zod
      const validated = EstadoCorreoCreateSchema.parse(input);

      // Normalizar datos
      const normalizedInput = {
        ...validated,
        estado_guia: validated.estado_guia?.toUpperCase() || "INICIAL",
        ubicacion_actual: validated.ubicacion_actual?.toUpperCase() ||
          "PENDIENTE",
        primera_visita: validated.primera_visita?.toUpperCase() || null,
      };

      const sap: string = input.sap_id;
      const validateSAP = await this.model.getBySAP({ sap });
      if (!validateSAP) {
        throw new Error("SAP no válido");
      }

      const estado = await this.model.add({ input: normalizedInput });

      if (!estado) {
        throw new Error("Error al crear el estado");
      }

      console.log(
        `[INFO] Estado creado exitosamente: ${estado.estado_correo_id}`,
      );
      return estado;
    } catch (error) {
      console.error("[ERROR] EstadoCorreoService.create:", error);
      throw new Error(
        `Error al crear estado: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
      );
    }
  }

  /**
   * Actualiza un estado existente
   */
  async update(params: {
    id: string;
    input: Partial<EstadoCorreoUpdate>;
  }): Promise<EstadoCorreo | undefined> {
    try {
      if (!params.id || params.id.trim() === "") {
        throw new Error("ID de estado requerido");
      }

      if (!params.input || Object.keys(params.input).length === 0) {
        throw new Error("No hay datos para actualizar");
      }

      console.log(`[INFO] Actualizando estado: ${params.id}`);

      // Verificar existencia
      const existingEstado = await this.model.getById({ id: params.id });
      if (!existingEstado) {
        throw new Error(`Estado con ID ${params.id} no encontrado`);
      }

      const sapId = params.input.sap_id.toUpperCase();
      const existeSap = await this.model.getBySAP({ sap: sapId });
      console.log(existeSap);
      if (!existeSap) {
        throw new Error(
          `NO existe el SAP ID ${params.input.sap_id.toUpperCase()}`,
        );
      }

      // Normalizar datos
      const normalizedInput = { ...params.input };

      if (normalizedInput.estado_guia) {
        normalizedInput.estado_guia = normalizedInput.estado_guia.toUpperCase();
      }
      if (normalizedInput.ubicacion_actual) {
        normalizedInput.ubicacion_actual = normalizedInput.ubicacion_actual
          .toUpperCase();
      }
      if (normalizedInput.primera_visita) {
        normalizedInput.primera_visita = normalizedInput.primera_visita
          .toUpperCase();
      }

      const estadoActualizado = await this.model.update({
        id: params.id,
        input: normalizedInput,
      });

      if (!estadoActualizado) {
        throw new Error("Error al actualizar estado");
      }

      console.log(
        `[INFO] Estado actualizado exitosamente: ${estadoActualizado.estado_correo_id}`,
      );
      return estadoActualizado;
    } catch (error) {
      console.error("[ERROR] EstadoCorreoService.update:", error);
      throw new Error(
        `Error al actualizar estado: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
      );
    }
  }

  /**
   * Elimina un estado
   */
  async delete(params: { id: string }): Promise<void> {
    try {
      if (!params.id || params.id.trim() === "") {
        throw new Error("ID de estado requerido");
      }

      console.log(`[INFO] Eliminando estado: ${params.id}`);

      const existingEstado = await this.model.getById({ id: params.id });
      if (!existingEstado) {
        throw new Error(`Estado con ID ${params.id} no encontrado`);
      }

      const deleted = await this.model.delete(params);

      if (!deleted) {
        throw new Error("Error al eliminar estado");
      }

      console.log(`[INFO] Estado ${params.id} eliminado exitosamente`);
    } catch (error) {
      console.error("[ERROR] EstadoCorreoService.delete:", error);
      throw new Error(
        `Error al eliminar estado: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
      );
    }
  }

  /**
   * Obtiene correos entregados
   */
  async getEntregados(): Promise<EstadoCorreo[]> {
    try {
      console.log("[INFO] Obteniendo correos entregados");
      const estados = await this.model.getEntregados();
      console.log(`[INFO] ${estados.length} correos entregados encontrados`);
      return estados;
    } catch (error) {
      console.error("[ERROR] EstadoCorreoService.getEntregados:", error);
      throw new Error(
        `Error al obtener correos entregados: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
      );
    }
  }

  /**
   * Obtiene correos no entregados
   */
  async getNoEntregados(): Promise<EstadoCorreo[]> {
    try {
      console.log("[INFO] Obteniendo correos no entregados");
      const estados = await this.model.getNoEntregados();
      console.log(`[INFO] ${estados.length} correos no entregados encontrados`);
      return estados;
    } catch (error) {
      console.error("[ERROR] EstadoCorreoService.getNoEntregados:", error);
      throw new Error(
        `Error al obtener correos no entregados: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
      );
    }
  }

  /**
   * Obtiene correos devueltos
   */
  async getDevueltos(): Promise<EstadoCorreo[]> {
    try {
      console.log("[INFO] Obteniendo correos devueltos");
      const estados = await this.model.getDevueltos();
      console.log(`[INFO] ${estados.length} correos devueltos encontrados`);
      return estados;
    } catch (error) {
      console.error("[ERROR] EstadoCorreoService.getDevueltos:", error);
      throw new Error(
        `Error al obtener correos devueltos: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
      );
    }
  }

  /**
   * Marca un correo como entregado
   */
  async marcarComoEntregado(
    { id }: { id: string },
  ): Promise<EstadoCorreo | undefined> {
    try {
      if (!id || id.trim() === "") {
        throw new Error("ID de estado requerido");
      }

      console.log(`[INFO] Marcando correo como entregado: ${id}`);

      const estado = await this.model.marcarComoEntregado({ id });

      if (!estado) {
        throw new Error("Error al marcar correo como entregado");
      }

      console.log(`[INFO] Correo marcado como entregado: ${id}`);
      return estado;
    } catch (error) {
      console.error("[ERROR] EstadoCorreoService.marcarComoEntregado:", error);
      throw new Error(
        `Error al marcar como entregado: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
      );
    }
  }

  /**
   * Actualiza la ubicación actual de un correo
   */
  async actualizarUbicacion(params: {
    id: string;
    ubicacion: string;
  }): Promise<EstadoCorreo | undefined> {
    try {
      if (!params.id || params.id.trim() === "") {
        throw new Error("ID de estado requerido");
      }

      if (!params.ubicacion || params.ubicacion.trim() === "") {
        throw new Error("Ubicación requerida");
      }

      console.log(`[INFO] Actualizando ubicación: ${params.id}`);

      const estado = await this.model.actualizarUbicacion({
        id: params.id,
        ubicacion: params.ubicacion.toUpperCase(),
      });

      if (!estado) {
        throw new Error("Error al actualizar ubicación");
      }

      console.log(`[INFO] Ubicación actualizada: ${params.ubicacion}`);
      return estado;
    } catch (error) {
      console.error("[ERROR] EstadoCorreoService.actualizarUbicacion:", error);
      throw new Error(
        `Error al actualizar ubicación: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
      );
    }
  }

  /**
   * Obtiene estadísticas de estados
   */
  async getStats(): Promise<{
    total: number;
    entregados: number;
    noEntregados: number;
    devueltos: number;
    porcentajeEntrega: number;
  }> {
    try {
      console.log("[INFO] Obteniendo estadísticas de estados");

      const [entregados, noEntregados, devueltos] = await Promise.all([
        this.model.getEntregados(),
        this.model.getNoEntregados(),
        this.model.getDevueltos(),
      ]);

      const total = entregados.length + noEntregados.length + devueltos.length;
      const porcentajeEntrega = total > 0
        ? Math.round((entregados.length / total) * 100)
        : 0;

      const stats = {
        total,
        entregados: entregados.length,
        noEntregados: noEntregados.length,
        devueltos: devueltos.length,
        porcentajeEntrega,
      };

      console.log(`[INFO] Estadísticas: ${stats.total} estados totales`);
      return stats;
    } catch (error) {
      console.error("[ERROR] EstadoCorreoService.getStats:", error);
      throw new Error(
        `Error al obtener estadísticas: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
      );
    }
  }

  /**
   * Obtiene estados por rango de fechas
   */
  async getByFechaRango(params: {
    fechaInicio: Date;
    fechaFin: Date;
  }): Promise<EstadoCorreo[]> {
    try {
      if (!params.fechaInicio || !params.fechaFin) {
        throw new Error("Fechas de inicio y fin requeridas");
      }

      if (params.fechaInicio > params.fechaFin) {
        throw new Error("La fecha de inicio debe ser menor a la fecha fin");
      }

      console.log(
        `[INFO] Obteniendo estados por rango: ${params.fechaInicio} - ${params.fechaFin}`,
      );

      const estados = await this.model.getByFechaRango(params);

      console.log(`[INFO] ${estados.length} estados encontrados en el rango`);
      return estados;
    } catch (error) {
      console.error("[ERROR] EstadoCorreoService.getByFechaRango:", error);
      throw new Error(
        `Error al obtener estados por fecha: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
      );
    }
  }

  /**
   * Obtiene estados por ubicación
   */
  async getByUbicacion(
    { ubicacion }: { ubicacion: string },
  ): Promise<EstadoCorreo[]> {
    try {
      if (!ubicacion || ubicacion.trim() === "") {
        throw new Error("Ubicación requerida");
      }

      console.log(`[INFO] Obteniendo estados por ubicación: ${ubicacion}`);

      const estados = await this.model.getByUbicacion({ ubicacion });

      console.log(`[INFO] ${estados.length} estados encontrados`);
      return estados;
    } catch (error) {
      console.error("[ERROR] EstadoCorreoService.getByUbicacion:", error);
      throw new Error(
        `Error al obtener estados por ubicación: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
      );
    }
  }
}
