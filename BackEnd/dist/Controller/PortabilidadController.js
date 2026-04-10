// BackEnd/src/Controller/PortabilidadController.ts
// ============================================
import { logger } from "../Utils/logger";
import { PortabilidadService } from "../services/PortabilidadService";
import { VentaService } from "../services/VentaService";
import { LineaNuevaService } from "../services/LineaNuevaService";
export class PortabilidadController {
    service;
    ventaService;
    lineaNuevaService;
    constructor(model, ventaModel, lineaNuevaModel) {
        this.service = new PortabilidadService(model);
        this.ventaService = new VentaService(ventaModel);
        this.lineaNuevaService = new LineaNuevaService(lineaNuevaModel);
    }
    // deno-lint-ignore require-await
    async getAll(params = {}) {
        return this.service.getAll(params);
    }
    // deno-lint-ignore require-await
    async getById({ id }) {
        return this.service.getById({ id });
    }
    async create({ portabilidad }) {
        logger.debug(portabilidad);
        // Verificar que la venta existe y es PORTABILIDAD
        const id_venta = portabilidad.venta.toString();
        const venta = await this.ventaService.getById(id_venta);
        if (!venta) {
            throw new Error("Venta no existe");
        }
        if (venta.tipo_venta !== "PORTABILIDAD") {
            throw new Error("La venta no es de tipo PORTABILIDAD");
        }
        // Verificar que no tenga linea_nueva
        const lineaNueva = await this.lineaNuevaService.getByVenta({
            venta: portabilidad.venta,
        });
        if (lineaNueva) {
            throw new Error("La venta ya tiene linea nueva asociada");
        }
        return this.service.create({ portabilidad });
    }
    // deno-lint-ignore require-await
    async update({ id, portabilidad }) {
        return this.service.update({ id, portabilidad });
    }
    // deno-lint-ignore require-await
    async delete({ id }) {
        return this.service.delete({ id });
    }
    // deno-lint-ignore require-await
    async getByVenta({ venta }) {
        return this.service.getByVenta({ venta });
    }
    async getStatistics() {
        try {
            const stats = await this.service.getStatistics();
            return stats;
        }
        catch (error) {
            logger.error("PortabilidadController.getStatistics:", error);
            throw error;
        }
    }
    // deno-lint-ignore require-await
    async getByEstado({ estado }) {
        return this.service.getByEstado({ estado });
    }
}
//# sourceMappingURL=PortabilidadController.js.map