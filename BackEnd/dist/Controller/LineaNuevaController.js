// BackEnd/src/Controller/LineaNuevaController.ts
// ============================================
import { logger } from "../Utils/logger.ts";
import { LineaNuevaService } from "../services/LineaNuevaService.ts";
import { VentaService } from "../services/VentaService.ts";
import { PortabilidadService } from "../services/PortabilidadService.ts";
export class LineaNuevaController {
    service;
    ventaService;
    portabilidadService;
    constructor(model, ventaModel, portabilidadModel) {
        this.service = new LineaNuevaService(model);
        this.ventaService = new VentaService(ventaModel);
        this.portabilidadService = new PortabilidadService(portabilidadModel);
    }
    // deno-lint-ignore require-await
    async getAll(params = {}) {
        return this.service.getAll(params);
    }
    // deno-lint-ignore require-await
    async getById({ id }) {
        return this.service.getById({ id });
    }
    async create({ lineaNueva }) {
        // Verificar que la venta existe y es LINEA_NUEVA
        const venta = await this.ventaService.getById(lineaNueva.venta.toString());
        if (!venta) {
            throw new Error("Venta no existe");
        }
        if (venta.tipo_venta !== "LINEA_NUEVA") {
            throw new Error("La venta no es de tipo LINEA_NUEVA");
        }
        // Verificar que no tenga portabilidad
        const portabilidad = await this.portabilidadService.getByVenta({ venta: lineaNueva.venta });
        if (portabilidad) {
            throw new Error("La venta ya tiene portabilidad asociada");
        }
        return this.service.create({ lineaNueva });
    }
    // deno-lint-ignore require-await
    async update({ id, lineaNueva }) {
        return this.service.update({ id, lineaNueva });
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
            logger.error("LineaNuevaController.getStatistics:", error);
            throw error;
        }
    }
    // deno-lint-ignore require-await
    async getByEstado({ estado }) {
        return this.service.getByEstado({ estado });
    }
}
//# sourceMappingURL=LineaNuevaController.js.map