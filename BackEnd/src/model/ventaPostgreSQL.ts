// model/ventaPostgreSQL.ts
// ============================================
// Modelo Venta para PostgreSQL con conexión resiliente
// Sistema que siempre funciona aunque la BD no esté disponible
// ============================================

import { ResilientPostgresConnection, safeQuery, ServiceDegradedError, beginTransaction, commitTransaction, rollbackTransaction } from "../database/PostgreSQL.ts";
import { logger } from "../Utils/logger.ts";
import { VentaModelDB } from "../interface/venta.ts";
import { Venta, VentaCreate } from "../schemas/venta/Venta.ts";

interface VentaRow {
  venta_id: number;
  sds: string;
  chip: string;
  stl: string;
  tipo_venta: string;
  sap: string;
  cliente_id: string;
  vendedor_id: string;
  multiple: number;
  plan_id: number;
  promocion_id: number | null;
  empresa_origen_id: number;
  fecha_creacion: Date;
}

export class VentaPostgreSQL implements VentaModelDB {
  connection: ResilientPostgresConnection;

  constructor(connection: ResilientPostgresConnection) {
    this.connection = connection;
  }

  private mapRowToVenta(row: VentaRow): Venta {
    return {
      venta_id: row.venta_id,
      sds: row.sds,
      chip: row.chip as "SIM" | "ESIM",
      stl: row.stl,
      tipo_venta: row.tipo_venta as "PORTABILIDAD" | "LINEA_NUEVA",
      sap: row.sap,
      cliente_id: row.cliente_id,
      vendedor_id: row.vendedor_id,
      multiple: row.multiple,
      plan_id: row.plan_id,
      promocion_id: row.promocion_id as number,
      empresa_origen_id: row.empresa_origen_id,
      fecha_creacion: row.fecha_creacion,
    };
  }

  async getAll(
    params: { page?: number; limit?: number } = {},
  ): Promise<Venta[]> {
    const { page = 1, limit = 10 } = params;
    const offset = (page - 1) * limit;

    const safeResult = await safeQuery(
      this.connection,
      `SELECT * FROM venta LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    if (!safeResult.success) {
      logger.warn("getAll() - Modo degradado, retornando array vacío");
      return [];
    }

    logger.debug("Venta rows:", safeResult.data?.rows || []);

    return (safeResult.data?.rows || []).map((row: VentaRow) => this.mapRowToVenta(row));
  }

  async getById({ id }: { id: string }): Promise<Venta | undefined> {
    const safeResult = await safeQuery(
      this.connection,
      `SELECT * FROM venta WHERE venta_id = ?`,
      [id]
    );

    if (!safeResult.success) {
      throw new ServiceDegradedError("Servicio de ventas no disponible - Modo degradado");
    }

    if (!safeResult.data?.rows.length) return undefined;

    return this.mapRowToVenta(safeResult.data.rows[0]);
  }

  async getBySDS({ sds }: { sds: string }): Promise<Venta | undefined> {
    const safeResult = await safeQuery(
      this.connection,
      `SELECT * FROM venta WHERE sds = ?`,
      [sds]
    );

    if (!safeResult.success) {
      throw new ServiceDegradedError("Servicio de ventas no disponible - Modo degradado");
    }

    if (!safeResult.data?.rows.length) return undefined;

    return this.mapRowToVenta(safeResult.data.rows[0]);
  }

  async getBySPN({ spn }: { spn: string }): Promise<Venta | undefined> {
    const safeResult = await safeQuery(
      this.connection,
      `SELECT * FROM venta WHERE sap = ?`,
      [spn]
    );

    if (!safeResult.success) {
      throw new ServiceDegradedError("Servicio de ventas no disponible - Modo degradado");
    }

    return safeResult.data?.rows?.[0] as Venta | undefined;
  }

  async getBySAP({ sap }: { sap: string }): Promise<Venta | undefined> {
    const safeResult = await safeQuery(
      this.connection,
      `SELECT * FROM venta WHERE sap = ?`,
      [sap]
    );

    if (!safeResult.success) {
      throw new ServiceDegradedError("Servicio de ventas no disponible - Modo degradado");
    }

    if (!safeResult.data?.rows.length) return undefined;

    return this.mapRowToVenta(safeResult.data.rows[0]);
  }

  async add({ input }: { input: VentaCreate }): Promise<Venta> {
    const {
      sds,
      chip,
      stl,
      tipo_venta,
      sap,
      cliente_id,
      vendedor_id,
      multiple,
      plan_id,
      promocion_id,
      empresa_origen_id,
    } = input;

    const safeResult = await safeQuery(
      this.connection,
      `INSERT INTO venta (sds, chip, stl, tipo_venta, sap, cliente_id, vendedor_id, multiple, plan_id, promocion_id, empresa_origen_id, fecha_creacion)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       RETURNING venta_id`,
      [
        sds,
        chip,
        stl,
        tipo_venta,
        sap,
        cliente_id,
        vendedor_id,
        multiple,
        plan_id,
        promocion_id,
        empresa_origen_id,
        new Date(),
      ],
    );

    if (!safeResult.success) {
      throw new ServiceDegradedError("Error al crear venta - Base de datos no disponible");
    }

    const newId = safeResult.data?.rows[0]?.venta_id;

    return {
      venta_id: newId as number,
      sds,
      chip,
      stl: stl || null,
      tipo_venta,
      sap: sap || null,
      cliente_id,
      vendedor_id,
      multiple,
      plan_id,
      promocion_id: promocion_id as number,
      empresa_origen_id,
      fecha_creacion: new Date(),
    };
  }

  async update(
    { id, input }: { id: string; input: Partial<Venta> },
  ): Promise<Venta | undefined> {
    const fields = [];
    const values: (string | number)[] = [];

    if (input.sds !== undefined) {
      fields.push(`sds = $${values.length + 1}`);
      values.push(input.sds);
    }
    if (input.stl !== undefined) {
      fields.push(`stl = $${values.length + 1}`);
      values.push(input.stl);
    }
    if (input.cliente_id !== undefined) {
      fields.push(`cliente_id = $${values.length + 1}`);
      values.push(input.cliente_id);
    }
    if (input.vendedor_id !== undefined) {
      fields.push(`vendedor_id = $${values.length + 1}`);
      values.push(input.vendedor_id);
    }
    if (input.sap !== undefined) {
      fields.push(`sap = $${values.length + 1}`);
      values.push(input.sap);
    }
    if (input.chip !== undefined) {
      fields.push(`chip = $${values.length + 1}`);
      values.push(input.chip);
    }

    if (input.plan_id !== undefined) {
      fields.push(`plan_id = $${values.length + 1}`);
      values.push(input.plan_id);
    }
    if (input.promocion_id !== undefined) {
      fields.push(`promocion_id = $${values.length + 1}`);
      values.push(input.promocion_id);
    }
    if (input.multiple !== undefined) {
      fields.push(`multiple = $${values.length + 1}`);
      values.push(input.multiple);
    }

    if (fields.length === 0) return undefined;

    values.push(id);

    const safeResult = await safeQuery(
      this.connection,
      `UPDATE venta SET ${fields.join(", ")} WHERE venta_id = $${values.length}`,
      values
    );

    if (!safeResult.success) {
      throw new ServiceDegradedError("Error al actualizar venta - Base de datos no disponible");
    }

    if (safeResult.data?.rowCount !== undefined && safeResult.data.rowCount > 0) {
      return await this.getById({ id });
    }

    return undefined;
  }

  async delete({ id }: { id: string }): Promise<boolean> {
    const safeResult = await safeQuery(
      this.connection,
      `DELETE FROM venta WHERE venta_id = ?`,
      [id]
    );

    if (!safeResult.success) {
      logger.warn(`No se pudo eliminar venta ${id} - Base de datos no disponible`);
      return false;
    }

    return safeResult.data?.rowCount !== undefined && safeResult.data.rowCount > 0;
  }

  async getByVendedor({ vendedor }: { vendedor: string }): Promise<Venta[]> {
    const safeResult = await safeQuery(
      this.connection,
      `SELECT * FROM venta WHERE vendedor_id = ?`,
      [vendedor]
    );

    if (!safeResult.success) {
      logger.warn("getByVendedor() - Modo degradado, retornando array vacío");
      return [];
    }

    return (safeResult.data?.rows || []).map((row: VentaRow) => this.mapRowToVenta(row));
  }

  async getByCliente({ cliente }: { cliente: string }): Promise<Venta[]> {
    const safeResult = await safeQuery(
      this.connection,
      `SELECT * FROM venta WHERE cliente_id = ?`,
      [cliente]
    );

    if (!safeResult.success) {
      logger.warn("getByCliente() - Modo degradado, retornando array vacío");
      return [];
    }

    return (safeResult.data?.rows || []).map((row: VentaRow) => this.mapRowToVenta(row));
  }

  async getByPlan({ plan }: { plan: number }): Promise<Venta[]> {
    const safeResult = await safeQuery(
      this.connection,
      `SELECT * FROM venta WHERE plan_id = ?`,
      [plan]
    );

    if (!safeResult.success) {
      logger.warn("getByPlan() - Modo degradado, retornando array vacío");
      return [];
    }

    return (safeResult.data?.rows || []).map((row: VentaRow) => this.mapRowToVenta(row));
  }

  async getByDateRange(
    { start, end }: { start: Date; end: Date },
  ): Promise<Venta[]> {
    const safeResult = await safeQuery(
      this.connection,
      `SELECT * FROM venta WHERE fecha_creacion BETWEEN ? AND ?`,
      [start, end]
    );

    if (!safeResult.success) {
      logger.warn("getByDateRange() - Modo degradado, retornando array vacío");
      return [];
    }

    return (safeResult.data?.rows || []).map((row: VentaRow) => this.mapRowToVenta(row));
  }

  async getStatistics(): Promise<{
    totalVentas: number;
    ventasPorPlan: Array<
      { plan_id: number; plan_nombre: string; cantidad: number }
    >;
    ventasPorVendedor: Array<
      { vendedor_id: string; vendedor_nombre: string; cantidad: number }
    >;
    ventasPorMes: Array<{ mes: string; cantidad: number }>;
  }> {
    // Total ventas
    const totalSafeResult = await safeQuery(
      this.connection,
      `SELECT COUNT(*) as total FROM venta`
    );
    
    if (!totalSafeResult.success) {
      logger.warn("getStatistics() - Modo degradado, retornando valores cero");
      return {
        totalVentas: 0,
        ventasPorPlan: [],
        ventasPorVendedor: [],
        ventasPorMes: [],
      };
    }

    const totalVentas = totalSafeResult.data?.rows[0]?.total || 0;

    // Ventas por plan
    const planSafeResult = await safeQuery(
      this.connection,
      `SELECT p.plan_id, p.nombre, COUNT(*) as cantidad
      FROM plan p
      LEFT JOIN venta v ON p.plan_id = v.plan_id
      GROUP BY p.plan_id, p.nombre`
    );
    
    const ventasPorPlan = (planSafeResult.data?.rows || []).map((
      row: any,
    ) => ({
      plan_id: row.plan_id,
      plan_nombre: row.nombre,
      cantidad: row.cantidad,
    }));

    // Ventas por vendedor
    const vendedorSafeResult = await safeQuery(this.connection, `
      SELECT v.vendedor_id, CONCAT(pe.nombre, ' ', pe.apellido) as nombre, COUNT(*) as cantidad
      FROM venta v
      INNER JOIN usuario u ON u.persona_id = v.vendedor_id
      INNER JOIN persona pe ON pe.persona_id = u.persona_id
      GROUP BY v.vendedor_id, pe.nombre, pe.apellido
    `);
    
    const ventasPorVendedor = (vendedorSafeResult.data?.rows || []).map((
      row: any,
    ) => ({
      vendedor_id: row.vendedor_id,
      vendedor_nombre: row.nombre,
      cantidad: row.cantidad,
    }));

    // Ventas por mes - DATE_FORMAT → TO_CHAR
    const mesSafeResult = await safeQuery(this.connection, `
      SELECT TO_CHAR(fecha_creacion, 'YYYY-MM') as mes, COUNT(*) as cantidad
      FROM venta
      GROUP BY mes
      ORDER BY mes
    `);

    const ventasPorMes = (mesSafeResult.data?.rows || []).map((row: any) => ({
      mes: row.mes,
      cantidad: row.cantidad,
    }));

    return {
      totalVentas,
      ventasPorPlan,
      ventasPorVendedor,
      ventasPorMes,
    };
  }
}