import { logger } from "../Utils/logger";
export class CelulaService {
    celulaModel;
    constructor(celulaModel) {
        this.celulaModel = celulaModel;
    }
    async getAll(params = {}) {
        try {
            const celulas = await this.celulaModel.getAll(params);
            return celulas;
        }
        catch (error) {
            logger.error("CelulaService.getAll:", error);
            throw error;
        }
    }
    async getById(id) {
        try {
            const celula = await this.celulaModel.getById({ id });
            return celula;
        }
        catch (error) {
            logger.error("CelulaService.getById:", error);
            throw error;
        }
    }
    async getByEmpresa(empresa) {
        try {
            const celulas = await this.celulaModel.getByEmpresa({ empresa });
            return celulas;
        }
        catch (error) {
            logger.error("CelulaService.getByEmpresa:", error);
            throw error;
        }
    }
    async getAsesoresByCelula(id_celula) {
        try {
            const asesores = await this.celulaModel.getAsesoresByCelula({ id_celula });
            return asesores;
        }
        catch (error) {
            logger.error("CelulaService.getAsesoresByCelula:", error);
            throw error;
        }
    }
    async getPaisByCelulaId(id_celula) {
        try {
            const celula = await this.celulaModel.getById({ id: id_celula });
            return celula?.pais_venta || null;
        }
        catch (error) {
            logger.error("CelulaService.getPaisByCelulaId:", error);
            throw error;
        }
    }
    async getPaisByUsuarioId(usuarioId) {
        try {
            // Obtener la célula del usuario desde el modelo de usuario
            const client = this.celulaModel.connection.getClient();
            const result = await client.queryObject(`SELECT c.pais_venta 
         FROM usuario u 
         INNER JOIN celula c ON u.celula = c.id_celula 
         WHERE u.persona_id = $1`, [usuarioId]);
            return result.rows[0]?.pais_venta || null;
        }
        catch (error) {
            logger.error("CelulaService.getPaisByUsuarioId:", error);
            return null;
        }
    }
    async getCelulasByPais(pais) {
        try {
            const client = this.celulaModel.connection.getClient();
            const result = await client.queryObject(`SELECT * FROM celula WHERE pais_venta = $1 ORDER BY id_celula`, [pais]);
            return result.rows || [];
        }
        catch (error) {
            logger.error("CelulaService.getCelulasByPais:", error);
            throw error;
        }
    }
    async create(input) {
        try {
            // Verificar si ya existe
            const exists = await this.celulaModel.checkExists({ id: input.id_celula });
            if (exists) {
                throw new Error(`Ya existe una célula con ID ${input.id_celula}`);
            }
            const newCelula = await this.celulaModel.add({ input });
            logger.info(`Célula ${input.id_celula} creada exitosamente`);
            return newCelula;
        }
        catch (error) {
            logger.error("CelulaService.create:", error);
            throw error;
        }
    }
    async update(id, input) {
        try {
            // Verificar que existe
            const exists = await this.celulaModel.checkExists({ id });
            if (!exists) {
                throw new Error(`No existe una célula con ID ${id}`);
            }
            const updatedCelula = await this.celulaModel.update({ id, input });
            logger.info(`Célula ${id} actualizada exitosamente`);
            return updatedCelula;
        }
        catch (error) {
            logger.error("CelulaService.update:", error);
            throw error;
        }
    }
    async delete(id) {
        try {
            // Verificar que existe
            const exists = await this.celulaModel.checkExists({ id });
            if (!exists) {
                throw new Error(`No existe una célula con ID ${id}`);
            }
            const deleted = await this.celulaModel.delete({ id });
            logger.info(`Célula ${id} eliminada exitosamente`);
            return deleted;
        }
        catch (error) {
            logger.error("CelulaService.delete:", error);
            throw error;
        }
    }
}
//# sourceMappingURL=CelulaService.js.map