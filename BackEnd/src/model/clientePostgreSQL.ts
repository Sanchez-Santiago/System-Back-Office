// BackEnd/src/model/clientePostgreSQL.ts
// ============================================
import { ClienteUpdate } from "../schemas/persona/Cliente.ts";
import { ClienteModelDB } from "../interface/Cliente.ts";
import {
  Cliente,
  ClienteCreate,
  ClienteResponse,
} from "../schemas/persona/Cliente.ts";
import { ResilientPostgresConnection } from "../database/PostgreSQL.ts";
import { logger } from "../Utils/logger.ts";

export class ClientePostgreSQL implements ClienteModelDB {
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
      logger.error("ClientePostgreSQL.safeQuery:", error);
      throw error;
    }
  }

  async getAll(
    params: { page?: number; limit?: number } = {},
  ): Promise<Cliente[]> {
    const { page = 1, limit = 10 } = params;
    const offset = (page - 1) * limit;

    const result = await this.safeQuery<Cliente[]>(
      `SELECT * FROM cliente LIMIT $1 OFFSET $2`,
      [limit, offset],
    );

    return result || [];
  }

  async getById({ id }: { id: string }): Promise<Cliente | undefined> {
    return await this.getByPersonaId({ personaId: id });
  }

  async getByPersonaId(
    { personaId }: { personaId: string },
  ): Promise<Cliente | undefined> {
    const result = await this.safeQuery<Cliente[]>(
      `SELECT * FROM cliente WHERE persona_id = $1`,
      [personaId],
    );

    return result?.[0];
  }

  async getWithPersonaData(
    { personaId }: { personaId: string },
  ): Promise<ClienteResponse | undefined> {
    const result = await this.safeQuery<ClienteResponse[]>(
      `SELECT c.persona_id, p.nombre, p.apellido, p.email, p.documento, p.telefono, p.fecha_nacimiento
       FROM cliente c
       INNER JOIN persona p ON c.persona_id = p.persona_id
       WHERE c.persona_id = $1`,
      [personaId],
    );

    return result?.[0];
  }

  async getAllWithPersonaData(
    params: { page?: number; limit?: number } = {},
  ): Promise<ClienteResponse[]> {
    const { page = 1, limit = 10 } = params;
    const offset = (page - 1) * limit;

    const result = await this.safeQuery<ClienteResponse[]>(
      `SELECT c.persona_id, p.nombre, p.apellido, p.email, p.documento, p.telefono, p.fecha_nacimiento
       FROM cliente c
       INNER JOIN persona p ON c.persona_id = p.persona_id
       LIMIT $1 OFFSET $2`,
      [limit, offset],
    );

    return result || [];
  }

  async add({ input }: { input: ClienteCreate }): Promise<Cliente> {
    // Generar UUID para persona_id
    const persona_id = crypto.randomUUID();

    // Primero crear la persona
    const personaData = {
      nombre: input.nombre,
      apellido: input.apellido,
      fecha_nacimiento: input.fecha_nacimiento,
      documento: input.documento,
      email: input.email,
      telefono: input.telefono,
      tipo_documento: input.tipo_documento,
      nacionalidad: input.nacionalidad,
      genero: input.genero,
    };

    await this.safeQuery(
      `INSERT INTO persona (persona_id, nombre, apellido, fecha_nacimiento, documento, email, telefono, tipo_documento, nacionalidad, genero, creado_en)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        persona_id,
        personaData.nombre,
        personaData.apellido,
        personaData.fecha_nacimiento,
        personaData.documento,
        personaData.email,
        personaData.telefono || null,
        personaData.tipo_documento,
        personaData.nacionalidad,
        personaData.genero,
        new Date(),
      ],
    );

    // Ahora crear el cliente
    await this.safeQuery(
      `INSERT INTO cliente (persona_id) VALUES ($1)`,
      [persona_id]
    );

    return {
      persona_id,
    };
  }

  async update(
    { id, input }: { id: string; input: ClienteUpdate },
  ): Promise<Cliente | undefined> {

    // Si hay datos de persona para actualizar
    const personaFields = ['nombre', 'apellido', 'fecha_nacimiento', 'documento', 'email', 'telefono', 'tipo_documento', 'nacionalidad', 'genero'];
    const hasPersonaUpdates = personaFields.some(field => input[field as keyof ClienteUpdate] !== undefined);

    if (hasPersonaUpdates) {
      const updateFields: string[] = [];
      const values: (string | number | Date | null)[] = [];
      let paramIndex = 1;

      if (input.nombre !== undefined) {
        updateFields.push(`nombre = $${paramIndex++}`);
        values.push(input.nombre);
      }
      if (input.apellido !== undefined) {
        updateFields.push(`apellido = $${paramIndex++}`);
        values.push(input.apellido);
      }
      if (input.fecha_nacimiento !== undefined) {
        updateFields.push(`fecha_nacimiento = $${paramIndex++}`);
        values.push(input.fecha_nacimiento);
      }
      if (input.documento !== undefined) {
        updateFields.push(`documento = $${paramIndex++}`);
        values.push(input.documento);
      }
      if (input.email !== undefined) {
        updateFields.push(`email = $${paramIndex++}`);
        values.push(input.email);
      }
      if (input.telefono !== undefined) {
        updateFields.push(`telefono = $${paramIndex++}`);
        values.push(input.telefono);
      }
      if (input.tipo_documento !== undefined) {
        updateFields.push(`tipo_documento = $${paramIndex++}`);
        values.push(input.tipo_documento);
      }
      if (input.nacionalidad !== undefined) {
        updateFields.push(`nacionalidad = $${paramIndex++}`);
        values.push(input.nacionalidad);
      }
      if (input.genero !== undefined) {
        updateFields.push(`genero = $${paramIndex++}`);
        values.push(input.genero);
      }

      if (updateFields.length > 0) {
        values.push(id);
        await this.safeQuery(
          `UPDATE persona SET ${updateFields.join(', ')} WHERE persona_id = $${paramIndex}`,
          values
        );
      }
    }

    // Devolver el cliente actualizado
    return this.getById({ id });
  }

  async delete({ id }: { id: string }): Promise<boolean> {
    await this.safeQuery(
      `DELETE FROM cliente WHERE persona_id = $1`,
      [id],
    );

    return true;
  }
}