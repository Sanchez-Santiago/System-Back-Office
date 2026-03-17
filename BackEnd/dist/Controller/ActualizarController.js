export class ActualizarController {
    estadoCorreoModelDB;
    estadoVentaModelDB;
    ventaModelDB;
    correoModelDB;
    actualizarService;
    constructor(estadoCorreoModelDB, estadoVentaModelDB, ventaModelDB, correoModelDB, actualizarService) {
        this.estadoCorreoModelDB = estadoCorreoModelDB;
        this.estadoVentaModelDB = estadoVentaModelDB;
        this.ventaModelDB = ventaModelDB;
        this.correoModelDB = correoModelDB;
        this.actualizarService = actualizarService;
    }
    async actualizarEstadoCorreo(estadoNew, Guia, Estado, Descripcion, Ubicacion) {
        let count = 0;
        let numeroDeGuiaSAP = 0;
        let numeroDeEstadoSAP = 0;
        let numeroDeDescripcionSAP = 0;
        let numeroDeUbicacionSAP = 0;
        for (let i = 0; i < estadoNew[0].length; i++) {
            if (estadoNew[0][i] === "Guia") {
                console.log("Guia encontrada");
                numeroDeGuiaSAP = i;
            }
            if (estadoNew[0][i] === "Estado Guia") {
                console.log("Estado encontrada");
                numeroDeEstadoSAP = i;
            }
            if (estadoNew[0][i] === "Ultimo Evento Nombre") {
                console.log("Descripcion encontrada");
                numeroDeDescripcionSAP = i;
            }
            if (estadoNew[0][i] === "Ubicacion") {
                console.log("Ubicacion encontrada");
                numeroDeUbicacionSAP = i;
            }
        }
        if (Guia) {
            numeroDeGuiaSAP = Guia;
        }
        if (Estado) {
            numeroDeEstadoSAP = Estado;
        }
        if (Descripcion) {
            numeroDeDescripcionSAP = Descripcion;
        }
        if (Ubicacion) {
            numeroDeUbicacionSAP = Ubicacion;
        }
        const todosLosEstados = await this.estadoCorreoModelDB.getAll();
        if (!todosLosEstados || todosLosEstados.length === 0) {
            return 0;
        }
        // Optimización: Crear Map para búsqueda O(1) en lugar de O(n)
        const correoMap = new Map();
        for (const correo of todosLosEstados) {
            if (correo.sap_id) {
                correoMap.set(correo.sap_id, correo);
            }
        }
        for (const estado of estadoNew.slice(1)) {
            const guiaValue = estado[numeroDeGuiaSAP];
            if (!guiaValue)
                continue;
            const correo = correoMap.get(guiaValue);
            if (correo) {
                /*console.log(
                  `Estado: ${estado[numeroDeEstadoSAP]}, Descripcion: ${
                    estado[numeroDeDescripcionSAP]
                  }, Ubicacion: ${estado[numeroDeUbicacionSAP]}`,
                );*/
                const estadoCorreoCreate = {
                    estado: estado[numeroDeEstadoSAP],
                    descripcion: estado[numeroDeDescripcionSAP],
                    usuario_id: "0219c4f7-a760-4365-99e2-20929b47fe99",
                    ubicacion_actual: estado[numeroDeUbicacionSAP],
                };
                count += await this.actualizarService.actualizarEstadoCorreo(estadoCorreoCreate);
            }
        }
        return count;
    }
    async actualizarEstadoVenta(estadoNew, VentaSDS, Estado, Descripcion) {
        let count = 0;
        // DEBUG: Descomentar para debugging
        // console.log("=== INICIO actualizarEstadoVenta ===");
        // console.log("Total de filas recibidas:", estadoNew.length);
        // console.log("Headers:", estadoNew[0]);
        let numeroDeVentaSDS = -1;
        let numeroDeEstado = -1;
        let numeroDeDescripcion = -1;
        for (let i = 0; i < estadoNew[0].length; i++) {
            const header = estadoNew[0][i].trim();
            // DEBUG: Descomentar para debugging
            // console.log(`Header[${i}]: "${header}"`);
            if (header === "SDS") {
                // console.log("✓ SDS encontrada en posición", i);
                numeroDeVentaSDS = i;
            }
            if (header === "DESCRIPCION ESTADO") {
                // console.log("✓ DESCRIPCION ESTADO encontrada en posición", i);
                numeroDeEstado = i;
            }
            if (header === "DESCRIPCION RECHAZOS") {
                // console.log("✓ DESCRIPCION RECHAZOS encontrada en posición", i);
                numeroDeDescripcion = i;
            }
        }
        // Validar que se encontraron todos los headers necesarios
        if (numeroDeVentaSDS === -1) {
            console.error("✗ ERROR: No se encontró columna 'SDS'");
            return 0;
        }
        if (numeroDeEstado === -1) {
            console.error("✗ ERROR: No se encontró columna 'DESCRIPCION ESTADO'");
            return 0;
        }
        // DEBUG: Descomentar para debugging
        // console.log(
        //   "Índices encontrados - SDS:",
        //   numeroDeVentaSDS,
        //   "Estado:",
        //   numeroDeEstado,
        //   "Descripcion:",
        //   numeroDeDescripcion,
        // );
        if (VentaSDS !== undefined)
            numeroDeVentaSDS = VentaSDS;
        if (Estado !== undefined)
            numeroDeEstado = Estado;
        if (Descripcion !== undefined)
            numeroDeDescripcion = Descripcion;
        const todosLosEstadosActuales = await this.ventaModelDB.getAll({
            page: 1,
            limit: 100000,
        });
        // ✅ Validación agregada
        if (!todosLosEstadosActuales || todosLosEstadosActuales.length === 0) {
            console.error("✗ ERROR: No se encontraron ventas");
            return 0;
        }
        // Optimización: Crear Map para búsqueda O(1) en lugar de O(n)
        const ventasMap = new Map();
        for (const venta of todosLosEstadosActuales) {
            if (venta.sds) {
                ventasMap.set(venta.sds, venta);
            }
        }
        for (const estado of estadoNew.slice(1)) {
            const sdsValue = estado[numeroDeVentaSDS];
            if (!sdsValue)
                continue;
            const ventaActual = ventasMap.get(sdsValue);
            if (ventaActual) {
                //console.log(ventaActual, "Nuevo Estado:", estado[numeroDeEstado]);
                if (estado[numeroDeEstado] === undefined) {
                    console.error("✗ ERROR: Estado nuevo no definido");
                    continue;
                }
                const estadoVentaCreate = {
                    venta_id: ventaActual.venta_id,
                    estado: estado[numeroDeEstado],
                    descripcion: estado[numeroDeDescripcion] || "",
                    usuario_id: "0219c4f7-a760-4365-99e2-20929b47fe99",
                };
                // DEBUG: Descomentar para debugging
                // console.log("EstadoVentaCreate:", estadoVentaCreate);
                const result = await this.actualizarService.actualizarEstadoVenta(estadoVentaCreate);
                // DEBUG: Descomentar para debugging
                // console.log("Resultado de actualizarEstadoVenta:", result);
                count += result;
            }
            else {
                // DEBUG: Descomentar para debugging
                // console.log("Venta no encontrada:", estado[numeroDeVentaSDS]);
            }
            // console.log("Count acumulado:", count);
        }
        return count;
    }
    async actualizarSegumientoLinea(ventaNew, documento, fechaNacimiento, promo, planID, pedidoSTL, numeroDeContacto, pedidoSAP, ultimoStatus, operadoraPortacion, esnProMark, exaUsuario) {
        let count = 0;
        let numeroDeVentaDocumento = 0;
        let numeroDeFechaNacimiento = 0;
        let numeroDePromo = 0;
        let numeroDePlanID = 0;
        let numeroDePedidoSTL = 0;
        let numeroDeNumeroDeContacto = 0;
        let numeroDePedidoSAP = 0;
        let numeroDeUltimoStatus = 0;
        let numeroDeSRFromNunber = 0;
        let numeroDeOperadoraPortacion = 0;
        let numeroDeESNProMark = 0;
        let numeroDeEXAUsuario = 0;
        for (let i = 0; i < ventaNew[0].length; i++) {
            const header = ventaNew[0][i].trim();
            if (header === "DOCUMENTO") {
                numeroDeVentaDocumento = i;
                console.log("Documento encontrado en la columna", i);
            }
            if (header === "FECHA_NACIMIENTO") {
                numeroDeFechaNacimiento = i;
                console.log("Fecha de nacimiento encontrada en la columna", i);
            }
            if (header === "PROMO") {
                numeroDePromo = i;
                console.log("Promo encontrada en la columna", i);
            }
            if (header === "PLAN_ID") {
                numeroDePlanID = i;
                console.log("Plan ID encontrado en la columna", i);
            }
            if (header === "PEDIDO_STL") {
                numeroDePedidoSTL = i;
                console.log("Pedido STL encontrado en la columna", i);
            }
            if (header === "NUMERO_CONTACTO") {
                numeroDeNumeroDeContacto = i;
                console.log("Número de contacto encontrado en la columna", i);
            }
            if (header === "PEDIDO_SAP") {
                numeroDePedidoSAP = i;
                console.log("Pedido SAP encontrado en la columna", i);
            }
            if (header === "ULTIMO_STATUS") {
                numeroDeUltimoStatus = i;
                console.log("Último status encontrado en la columna", i);
            }
            if (header === "SR_FROM_NUMBER") {
                numeroDeSRFromNunber = i;
                console.log("SR From Number encontrado en la columna", i);
            }
            if (header === "OPERADORA_PORTACION") {
                numeroDeOperadoraPortacion = i;
                console.log("Operadora Portación encontrado en la columna", i);
            }
            if (header === "esn_pro_mark") {
                numeroDeESNProMark = i;
                console.log("ESN Pro Mark encontrado en la columna", i);
            }
            if (header === "EXA USUARIO") {
                numeroDeEXAUsuario = i;
                console.log("EXA Usuario encontrado en la columna", i);
            }
        }
        if (documento !== undefined)
            numeroDeNumeroDeContacto = documento;
        if (fechaNacimiento !== undefined) {
            numeroDeFechaNacimiento = fechaNacimiento;
        }
        if (promo !== undefined)
            numeroDePromo = promo;
        if (planID !== undefined)
            numeroDePlanID = planID;
        if (pedidoSTL !== undefined)
            numeroDePedidoSTL = pedidoSTL;
        if (numeroDeContacto !== undefined) {
            numeroDeNumeroDeContacto = numeroDeContacto;
        }
        if (pedidoSAP !== undefined)
            numeroDePedidoSAP = pedidoSAP;
        if (ultimoStatus !== undefined)
            numeroDeUltimoStatus = ultimoStatus;
        if (operadoraPortacion !== undefined) {
            numeroDeOperadoraPortacion = operadoraPortacion;
        }
        if (esnProMark !== undefined) {
            numeroDeESNProMark = esnProMark;
        }
        if (exaUsuario !== undefined) {
            numeroDeEXAUsuario = exaUsuario;
        }
        /*for (const venta of ventaNew.slice(1)) {
          const ventaCreate: VentaCreate = {
            venta_id: Number(venta[numeroDeVentaSAP]),
            estado: venta[numeroDeEstadoSAP] as EstadoVentaEstado, // Typed cast to satisfy lint
            descripcion: venta[numeroDeDescripcionSAP],
            usuario_id: "0000000000",
            fecha_creacion: new Date(),
          };
          count += await this.actualizarService.actualizarSegumientoLinea(
            ventaCreate,
          );
          }*/
        return count;
    }
}
//# sourceMappingURL=ActualizarController.js.map