// BackEnd/src/model/empresaOrigenPostgreSQL.ts
import { EmpresaOrigenModelDB, EmpresaOrigen, EmpresaOrigenCreate } from "../interface/EmpresaOrigen.ts";
import { ResilientPostgresConnection } from "../database/PostgreSQL.ts";
import { logger } from "../Utils/logger.ts";

export class EmpresaOrigenPostgreSQL implements EmpresaOrigenModelDB {
  connection: ResilientPostgresConnection;

  constructor(connection: ResilientPostgresConnection) {
    this.connection = connection;
  }

  private async safeQuery<T>(
    query: string, 
    params: any[] = []
  ): Promise<T> {
    try {
      return await this.connection.query(query, params);
    } catch (error) {
      logger.error("EmpresaOrigenPostgreSQL.safeQuery:", error);
      throw error;
    }
  }

  async getAll(params: { page?: number; limit?: number } = {}): Promise<EmpresaOrigen[]> {
    const { page = 1, limit = 10 } = params;
    const offset = (page - 1) * limit;

    const result = await this.safeQuery<EmpresaOrigen[]>(
      `SELECT * FROM empresa_origen LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return result || [];
  }

  async getById({ id }: { id: string }): Promise<EmpresaOrigen | undefined> {
    const result = await this.safeQuery<EmpresaOrigen[]>(
      `SELECT * FROM empresa_origen WHERE empresa_origen_id = $1`,
      [id]
    );

    return result?.[0];
  }

  async add({ input }: { input: EmpresaOrigenCreate }): Promise<EmpresaOrigen> {
    const { nombre_empresa, pais } = input;

    const result = await this.safeQuery<EmpresaOrigen[]>(
      `INSERT INTO empresa_origen (nombre_empresa, pais) 
       VALUES ($1, $2) 
       RETURNING *`,
      [nombre_empresa, pais]
    );

    if (!result || result.length === 0) {
      throw new Error("Error al crear empresa de origen");
    }

    return result[0];
  }

  async update({ id, input }: { id: string; input: Partial<EmpresaOrigen> }): Promise<EmpresaOrigen | undefined> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (input.nombre_empresa !== undefined) {
      fields.push(`nombre_empresa = $${paramIndex++}`);
      values.push(input.nombre_empresa);
    }
    if (input.pais !== undefined) {
      fields.push(`pais = $${paramIndex++}`);
      values.push(input.pais);
    }

    if (fields.length === 0) return undefined;

    values.push(id);

    const result = await this.safeQuery<EmpresaOrigen[]>(
      `UPDATE empresa_origen SET ${fields.join(", ")} WHERE empresa_origen_id = $${paramIndex} RETURNING *`,
      values
    );

    if (result && result.length > 0) {
      return result[0];
    }

    return undefined;
  }

  async delete({ id }: { id: string }): Promise<boolean> {
    await this.safeQuery(
      `DELETE FROM empresa_origen WHERE empresa_origen_id = $1`,
      [id]
    );

    return true;
  }
}