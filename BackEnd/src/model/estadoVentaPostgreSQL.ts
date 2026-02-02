// ============================================
// BackEnd/src/model/estadoVentaPostgreSQL.ts
// ============================================
import { EstadoVentaModelDB } from "../interface/EstadoVenta.ts";
import {
  EstadoVenta,
  EstadoVentaCreate,
  EstadoVentaEnum,
  EstadoVentaEstado,
  EstadoVentaUpdate,
} from "../schemas/venta/EstadoVenta.ts";
import { PostgresClient } from "../database/PostgreSQL.ts";
import { logger } from "../Utils/logger.ts";

interface EstadoVentaRow {
  estado_id: number;
  venta_id: number;
  estado: string;
  descripcion: string;
  fecha_creacion: Date;
  usuario_id: string;
}

export class EstadoVentaPostgreSQL implements EstadoVentaModelDB {
  connection: PostgresClient;

  constructor(connection: PostgresClient) {
    this.connection = connection;
  }

  private async safeQuery<T>(
    query: string,
    params: any[] = [],
  ): Promise<T> {
    try {
      const client = this.connection.getClient();
      const result = await client.queryArray(query, params);
      return result.rows as T;
    } catch (error) {
      logger.error("EstadoVentaPostgreSQL.safeQuery:", error);
      throw error;
    }
  }

  private mapRowToEstadoVenta(row: EstadoVentaRow): EstadoVenta {
    return {
      estado_id: row.estado_id,
      venta_id: row.venta_id,
      estado: row.estado as EstadoVentaEstado,
      descripcion: row.descripcion,
      fecha_creacion: row.fecha_creacion,
      usuario_id: row.usuario_id,
    };
  }

  async getAll(
    params: { page?: number; limit?: number } = {},
  ): Promise<EstadoVenta[]> {
    const { page = 1, limit = 10 } = params;
    const offset = (page - 1) * limit;

    const result = await this.safeQuery<EstadoVentaRow[]>(
      `SELECT * FROM estado ORDER BY fecha_creacion DESC LIMIT $1 OFFSET $2`,
      [limit, offset],
    );

    return (result || []).map((row: EstadoVentaRow) =>
      this.mapRowToEstadoVenta(row)
    );
  }

  async getById({ id }: { id: string }): Promise<EstadoVenta | undefined> {
    const result = await this.safeQuery<EstadoVentaRow[]>(
      `SELECT * FROM estado WHERE estado_id = $1`,
      [id],
    );

    return result?.[0] ? this.mapRowToEstadoVenta(result[0]) : undefined;
  }

  async getByVentaId(
    { venta_id }: { venta_id: number },
  ): Promise<EstadoVenta[]> {
    const result = await this.safeQuery<EstadoVentaRow[]>(
      `SELECT * FROM estado WHERE venta_id = $1 ORDER BY fecha_creacion DESC`,
      [venta_id],
    );

    return (result || []).map((row: EstadoVentaRow) =>
      this.mapRowToEstadoVenta(row)
    );
  }

  async add({ input }: { input: EstadoVentaCreate }): Promise<EstadoVenta> {
    // Validaciones de negocio
    await this.validateVentaId(input.venta_id);
    await this.validateUsuarioId(input.usuario_id);
    await this.validateEstado(input.estado);

    const { venta_id, estado, descripcion, usuario_id } = input;

    const result = await this.safeQuery<EstadoVentaRow[]>(
      `INSERT INTO estado (venta_id, estado, descripcion, fecha_creacion, usuario_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        venta_id,
        estado,
        descripcion,
        new Date(),
        usuario_id,
      ],
    );

    if (!result || result.length === 0) {
      throw new Error("Error al crear el estado de venta");
    }

    return this.mapRowToEstadoVenta(result[0]);
  }

  async update(
    { id, input }: { id: string; input: EstadoVentaUpdate },
  ): Promise<boolean> {
    // Validaciones si se proporcionan los campos
    if (input.estado) {
      await this.validateEstado(input.estado);
    }
    if (input.usuario_id) {
      await this.validateUsuarioId(input.usuario_id);
    }

    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (input.estado !== undefined) {
      fields.push(`estado = $${paramIndex++}`);
      values.push(input.estado);
    }
    if (input.descripcion !== undefined) {
      fields.push(`descripcion = $${paramIndex++}`);
      values.push(input.descripcion);
    }
    if (input.usuario_id !== undefined) {
      fields.push(`usuario_id = $${paramIndex++}`);
      values.push(input.usuario_id);
    }

    if (fields.length === 0) return false;

    values.push(id);

    const result = await this.safeQuery(
      `UPDATE estado SET ${fields.join(", ")} WHERE estado_id = $${paramIndex}`,
      values,
    );

    return true;
  }

  async delete({ id }: { id: string }): Promise<boolean> {
    const result = await this.safeQuery(
      `DELETE FROM estado WHERE estado_id = $1`,
      [id],
    );

    return true;
  }

  // ======================
  // MÉTODOS ADICIONALES
  // ======================

  /**
   * Obtiene el último estado de una venta (el más reciente)
   */
  async getLastByVentaId(
    { venta_id }: { venta_id: number },
  ): Promise<EstadoVenta | undefined> {
    const result = await this.safeQuery<EstadoVentaRow[]>(
      `SELECT * FROM estado WHERE venta_id = $1 ORDER BY fecha_creacion DESC LIMIT 1`,
      [venta_id],
    );

    return result?.[0] ? this.mapRowToEstadoVenta(result[0]) : undefined;
  }

  /**
   * Obtiene el estado actual de una venta (alias de getLastByVentaId para claridad semántica)
   */
  async getEstadoActualByVentaId(
    { venta_id }: { venta_id: number },
  ): Promise<EstadoVenta | undefined> {
    return this.getLastByVentaId({ venta_id });
  }

  /**
   * Filtra estados por rango de fechas
   */
  async getByFechaRango(params: {
    fechaInicio: Date;
    fechaFin: Date;
  }): Promise<EstadoVenta[]> {
    const { fechaInicio, fechaFin } = params;

    const result = await this.safeQuery<EstadoVentaRow[]>(
      `SELECT * FROM estado
       WHERE fecha_creacion >= $1 AND fecha_creacion <= $2
       ORDER BY fecha_creacion DESC`,
      [fechaInicio, fechaFin],
    );

    return (result || []).map((row: EstadoVentaRow) =>
      this.mapRowToEstadoVenta(row)
    );
  }

  /**
   * Filtra estados por tipo de estado específico
   */
  async getByEstado({ estado }: { estado: string }): Promise<EstadoVenta[]> {
    // Validar que el estado sea válido
    if (!EstadoVentaEnum.safeParse(estado).success) {
      throw new Error(`Estado inválido: ${estado}`);
    }

    const result = await this.safeQuery<EstadoVentaRow[]>(
      `SELECT * FROM estado WHERE estado = $1 ORDER BY fecha_creacion DESC`,
      [estado],
    );

    return (result || []).map((row: EstadoVentaRow) =>
      this.mapRowToEstadoVenta(row)
    );
  }

  /**
   * Obtiene estadísticas generales de los estados
   */
  async getEstadisticasGenerales(): Promise<{
    totalEstados: number;
    estadosPorTipo: Array<{ estado: string; cantidad: number }>;
    estadosPorMes: Array<{ mes: string; cantidad: number }>;
  }> {
    // Total de estados
    const totalResult = await this.safeQuery<Array<{ count: number }>>(
      `SELECT COUNT(*) as count FROM estado`,
    );

    // Estados por tipo
    const estadosPorTipoResult = await this.safeQuery<
      Array<{ estado: string; cantidad: number }>
    >(
      `SELECT estado, COUNT(*) as cantidad
       FROM estado
       GROUP BY estado
       ORDER BY cantidad DESC`,
    );

    // Estados por mes (últimos 12 meses)
    const estadosPorMesResult = await this.safeQuery<
      Array<{ mes: string; cantidad: number }>
    >(
      `SELECT TO_CHAR(fecha_creacion, 'YYYY-MM') as mes, COUNT(*) as cantidad
       FROM estado
       WHERE fecha_creacion >= NOW() - INTERVAL '12 months'
       GROUP BY TO_CHAR(fecha_creacion, 'YYYY-MM')
       ORDER BY mes DESC`,
    );

    return {
      totalEstados: totalResult?.[0]?.count || 0,
      estadosPorTipo: estadosPorTipoResult || [],
      estadosPorMes: estadosPorMesResult || [],
    };
  }

  /**
   * Filtra con múltiples parámetros opcionales
   */
  async getByMultipleFilters(params: {
    venta_id?: number;
    estado?: string;
    fechaInicio?: Date;
    fechaFin?: Date;
    usuario_id?: string;
    page?: number;
    limit?: number;
  }): Promise<EstadoVenta[]> {
    const {
      venta_id,
      estado,
      fechaInicio,
      fechaFin,
      usuario_id,
      page = 1,
      limit = 10,
    } = params;

    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (venta_id !== undefined) {
      conditions.push(`venta_id = $${paramIndex++}`);
      values.push(venta_id);
    }
    if (estado !== undefined) {
      conditions.push(`estado = $${paramIndex++}`);
      values.push(estado);
    }
    if (fechaInicio !== undefined) {
      conditions.push(`fecha_creacion >= $${paramIndex++}`);
      values.push(fechaInicio);
    }
    if (fechaFin !== undefined) {
      conditions.push(`fecha_creacion <= $${paramIndex++}`);
      values.push(fechaFin);
    }
    if (usuario_id !== undefined) {
      conditions.push(`usuario_id = $${paramIndex++}`);
      values.push(usuario_id);
    }

    const whereClause = conditions.length > 0
      ? `WHERE ${conditions.join(" AND ")}`
      : "";
    const offset = (page - 1) * limit;

    const result = await this.safeQuery<EstadoVentaRow[]>(
      `SELECT * FROM estado
       ${whereClause}
       ORDER BY fecha_creacion DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      [...values, limit, offset],
    );

    return (result || []).map((row: EstadoVentaRow) =>
      this.mapRowToEstadoVenta(row)
    );
  }

  /**
   * Creación masiva de estados para optimizar rendimiento
   */
  async bulkCreateEstados(
    estados: EstadoVentaCreate[],
  ): Promise<EstadoVenta[]> {
    if (estados.length === 0) return [];

    // Validar todos los estados antes de insertar
    for (const estado of estados) {
      await this.validateVentaId(estado.venta_id);
      await this.validateUsuarioId(estado.usuario_id);
      await this.validateEstado(estado.estado);
    }

    const values: any[] = [];
    const placeholders: string[] = [];
    let paramIndex = 1;

    estados.forEach((estado) => {
      const { venta_id, estado: estadoValor, descripcion, usuario_id } = estado;
      placeholders.push(
        `($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`,
      );
      values.push(venta_id, estadoValor, descripcion, new Date(), usuario_id);
    });

    const result = await this.safeQuery<EstadoVentaRow[]>(
      `INSERT INTO estado (venta_id, estado, descripcion, fecha_creacion, usuario_id)
       VALUES ${placeholders.join(", ")}
       RETURNING *`,
      values,
    );

    return (result || []).map((row: EstadoVentaRow) =>
      this.mapRowToEstadoVenta(row)
    );
  }

  // ======================
  // MÉTODOS DE VALIDACIÓN
  // ======================

  /**
   * Verifica que la venta exista en la tabla venta
   */
  private async validateVentaId(venta_id: number): Promise<void> {
    const result = await this.safeQuery<Array<{ venta_id: number }>>(
      `SELECT venta_id FROM venta WHERE venta_id = $1`,
      [venta_id],
    );

    if (!result || result.length === 0) {
      throw new Error(`La venta con ID ${venta_id} no existe`);
    }
  }

  /**
   * Verifica que el usuario exista y esté activo
   */
  private async validateUsuarioId(usuario_id: string): Promise<void> {
    const result = await this.safeQuery<Array<{ persona_id: string }>>(
      `SELECT persona_id FROM usuario WHERE persona_id = $1 AND estado = 'ACTIVO'`,
      [usuario_id],
    );

    if (!result || result.length === 0) {
      throw new Error(
        `El usuario con ID ${usuario_id} no existe o no está activo`,
      );
    }
  }

  /**
   * Verifica que el estado sea válido según el enum
   */
  private async validateEstado(estado: string): Promise<void> {
    const validation = EstadoVentaEnum.safeParse(estado);
    if (!validation.success) {
      throw new Error(
        `Estado inválido: ${estado}. Estados válidos: ${
          EstadoVentaEnum.options.join(", ")
        }`,
      );
    }
  }
}
