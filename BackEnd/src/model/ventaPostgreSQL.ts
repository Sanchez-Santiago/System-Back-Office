// model/ventaPostgreSQL.ts
// ============================================
// Modelo Venta para PostgreSQL con conexión resiliente
// Sistema que siempre funciona aunque la BD no esté disponible
// ============================================

import { PostgresClient } from "../database/PostgreSQL.ts";
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
  connection: PostgresClient;

  constructor(connection: PostgresClient) {
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

    const client = this.connection.getClient();
    const result = await client.queryArray(
      `SELECT * FROM venta LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    logger.debug("Venta rows:", result.rows || []);

    return (result.rows || []).map((row: VentaRow) => this.mapRowToVenta(row));
  }

  async getById({ id }: { id: string }): Promise<Venta | undefined> {
    const client = this.connection.getClient();
    const result = await client.queryArray(
      `SELECT * FROM venta WHERE venta_id = $1`,
      [id]
    );

    if (!result.rows.length) return undefined;

    return this.mapRowToVenta(result.rows[0]);
  }

  async getBySDS({ sds }: { sds: string }): Promise<Venta | undefined> {
    const client = this.connection.getClient();
    const result = await client.queryArray(
      `SELECT * FROM venta WHERE sds = $1`,
      [sds]
    );

    if (!result.rows.length) return undefined;

    return this.mapRowToVenta(result.rows[0]);
  }

  async getBySPN({ spn }: { spn: string }): Promise<Venta | undefined> {
    const client = this.connection.getClient();
    const result = await client.queryArray(
      `SELECT * FROM venta WHERE sap = $1`,
      [spn]
    );

    return result.rows?.[0] as Venta | undefined;
  }

  async getBySAP({ sap }: { sap: string }): Promise<Venta | undefined> {
    const client = this.connection.getClient();
    const result = await client.queryArray(
      `SELECT * FROM venta WHERE sap = $1`,
      [sap]
    );

    if (!result.rows.length) return undefined;

    return this.mapRowToVenta(result.rows[0]);
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

    const client = this.connection.getClient();
    const result = await client.queryArray(
      `INSERT INTO venta (sds, chip, stl, tipo_venta, sap, cliente_id, vendedor_id, multiple, plan_id, promocion_id, empresa_origen_id, fecha_creacion)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
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

    const newId = result.rows[0]?.venta_id;

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

    const client = this.connection.getClient();
    const result = await client.queryArray(
      `UPDATE venta SET ${fields.join(", ")} WHERE venta_id = $${values.length}`,
      values
    );

    if (result.rowCount !== undefined && result.rowCount > 0) {
      return await this.getById({ id });
    }

    return undefined;
  }

  async delete({ id }: { id: string }): Promise<boolean> {
    const client = this.connection.getClient();
    const result = await client.queryArray(
      `DELETE FROM venta WHERE venta_id = $1`,
      [id]
    );

    return result.rowCount !== undefined && result.rowCount > 0;
  }

  async getByVendedor({ vendedor }: { vendedor: string }): Promise<Venta[]> {
    const client = this.connection.getClient();
    const result = await client.queryArray(
      `SELECT * FROM venta WHERE vendedor_id = $1`,
      [vendedor]
    );

    return (result.rows || []).map((row: VentaRow) => this.mapRowToVenta(row));
  }

  async getByCliente({ cliente }: { cliente: string }): Promise<Venta[]> {
    const client = this.connection.getClient();
    const result = await client.queryArray(
      `SELECT * FROM venta WHERE cliente_id = $1`,
      [cliente]
    );

    return (result.rows || []).map((row: VentaRow) => this.mapRowToVenta(row));
  }

  async getByPlan({ plan }: { plan: number }): Promise<Venta[]> {
    const client = this.connection.getClient();
    const result = await client.queryArray(
      `SELECT * FROM venta WHERE plan_id = $1`,
      [plan]
    );

    return (result.rows || []).map((row: VentaRow) => this.mapRowToVenta(row));
  }

  async getByDateRange(
    { start, end }: { start: Date; end: Date },
  ): Promise<Venta[]> {
    const client = this.connection.getClient();
    const result = await client.queryArray(
      `SELECT * FROM venta WHERE fecha_creacion BETWEEN $1 AND $2`,
      [start, end]
    );

    return (result.rows || []).map((row: VentaRow) => this.mapRowToVenta(row));
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
    const client = this.connection.getClient();
    const totalResult = await client.queryArray(
      `SELECT COUNT(*) as total FROM venta`
    );
    
    const totalVentas = totalResult.rows[0]?.total || 0;

    // Ventas por plan
    const planResult = await client.queryArray(
      `SELECT p.plan_id, p.nombre, COUNT(*) as cantidad
      FROM plan p
      LEFT JOIN venta v ON p.plan_id = v.plan_id
      GROUP BY p.plan_id, p.nombre`
    );
    
    const ventasPorPlan = (planResult.rows || []).map((
      row: any,
    ) => ({
      plan_id: row.plan_id,
      plan_nombre: row.nombre,
      cantidad: row.cantidad,
    }));

    // Ventas por vendedor
    const vendedorResult = await client.queryArray(`
      SELECT v.vendedor_id, CONCAT(pe.nombre, ' ', pe.apellido) as nombre, COUNT(*) as cantidad
      FROM venta v
      INNER JOIN usuario u ON u.persona_id = v.vendedor_id
      INNER JOIN persona pe ON pe.persona_id = u.persona_id
      GROUP BY v.vendedor_id, pe.nombre, pe.apellido
    `);
    
    const ventasPorVendedor = (vendedorResult.rows || []).map((
      row: any,
    ) => ({
      vendedor_id: row.vendedor_id,
      vendedor_nombre: row.nombre,
      cantidad: row.cantidad,
    }));

    // Ventas por mes - DATE_FORMAT → TO_CHAR
    const mesResult = await client.queryArray(`
      SELECT TO_CHAR(fecha_creacion, 'YYYY-MM') as mes, COUNT(*) as cantidad
      FROM venta
      GROUP BY mes
      ORDER BY mes
    `);

    const ventasPorMes = (mesResult.rows || []).map((row: any) => ({
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