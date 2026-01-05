// ============================================
// BackEnd/src/router/VentaRouter.ts (CORREGIDO)
// ============================================
import { Context, Router } from "oak";

type ContextWithParams = Context & { params: Record<string, string> };
import { VentaController } from "../Controller/VentaController.ts";
import { VentaModelDB } from "../interface/venta.ts";
import { UserModelDB } from "../interface/Usuario.ts";
import { ClienteModelDB } from "../interface/Cliente.ts";
import { CorreoModelDB } from "../interface/correo.ts";
import { PortabilidadModelDB } from "../interface/Portabilidad.ts";
import { LineaNuevaModelDB } from "../interface/LineaNueva.ts";
import { PlanModelDB } from "../interface/Plan.ts";
import { PromocionModelDB } from "../interface/Promocion.ts";
import {
  VentaCreate,
  VentaCreateSchema,
  VentaUpdateSchema,
} from "../schemas/venta/Venta.ts";
import { PortabilidadCreate } from "../schemas/venta/Portabilidad.ts";
import { LineaNuevaCreate } from "../schemas/venta/LineaNueva.ts";
import { Plan } from "../schemas/venta/Plan.ts";
import { CorreoController } from "../Controller/CorreoController.ts";
import { LineaNuevaController } from "../Controller/LineaNuevaController.ts";
import { PortabilidadController } from "../Controller/PortabilidadController.ts";
import { EstadoVentaController } from "../Controller/EstadoVentaController.ts";
import { EstadoVentaService } from "../services/EstadoVentaService.ts";
import { EstadoVentaMySQL } from "../model/estadoVentaMySQL.ts";
import client from "../database/MySQL.ts";
import { PlanService } from "../services/PlanService.ts";
import { PromocionService } from "../services/PromocionService.ts";
import { authMiddleware } from "../middleware/authMiddlewares.ts";
import { rolMiddleware } from "../middleware/rolMiddlewares.ts";
import { ROLES_ADMIN, ROLES_MANAGEMENT } from "../constants/roles.ts";

export function ventaRouter(
  ventaModel: VentaModelDB,
  userModel: UserModelDB,
  correoModel: CorreoModelDB,
  lineaNuevaModel: LineaNuevaModelDB,
  portabilidadModel: PortabilidadModelDB,
  clienteModel: ClienteModelDB,
  planModel: PlanModelDB,
  promocionModel: PromocionModelDB,
) {
  const router = new Router();
  const ventaController = new VentaController(ventaModel, clienteModel);
  const planService = new PlanService(planModel);
  const promocionService = new PromocionService(promocionModel);
  const managementRoles = ["SUPERVISOR", "BACK_OFFICE", "SUPERADMIN", "ADMIN"];
  const managementMiddleware = rolMiddleware(
    managementRoles[0],
    managementRoles[1],
    managementRoles[2],
    managementRoles[3],
  );
  const estadoVentaModel = new EstadoVentaMySQL(client);
  const estadoVentaService = new EstadoVentaService(estadoVentaModel);
  const estadoVentaController = new EstadoVentaController(estadoVentaService);
  const correoController = new CorreoController(correoModel);
  const lineaNuevaController = new LineaNuevaController(
    lineaNuevaModel,
    ventaModel,
    portabilidadModel,
  );
  const portabilidadController = new PortabilidadController(
    portabilidadModel,
    ventaModel,
    lineaNuevaModel,
  );

  // ============================================
  // GET /ventas - Obtener todas las ventas
  // ============================================
  router.get(
    "/ventas",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_MANAGEMENT),
    async (ctx: Context) => {
      try {
        const page = 1;
        const limit = 10;

        console.log(`[INFO] GET /ventas - Página: ${page}Límite: ${limit}`);

        const ventas = await ventaController.getAll({ page, limit }) || [];

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          data: ventas,
          pagination: {
            page,
            limit,
            total: ventas.length,
          },
        };
      } catch (error) {
        console.error("[ERROR] GET /ventas:", error);
        ctx.response.status = 500;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al obtener ventas",
        };
      }
    },
  );

  // ============================================
  // GET /ventas/estadisticas - Obtener estadísticas de ventas
  // ============================================
  router.get(
    "/ventas/estadisticas",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_MANAGEMENT),
    async (ctx: Context) => {
      try {
        console.log("[INFO] GET /ventas/estadisticas");

        const stats = await ventaController.getStatistics();

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          data: stats,
        };
      } catch (error) {
        console.error("[ERROR] GET /ventas/estadisticas:", error);
        ctx.response.status = 500;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al obtener estadísticas",
        };
      }
    },
  );

  // ============================================
  // GET /ventas/fechas - Obtener ventas por rango de fechas
  // ============================================
  router.get(
    "/ventas/fechas",
    authMiddleware(userModel),
    async (ctx: Context) => {
      try {
        const url = ctx.request.url;
        const start = url.searchParams.get("start");
        const end = url.searchParams.get("end");

        if (!start || !end) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "Parámetros 'start' y 'end' son requeridos",
          };
          return;
        }

        const startDate = new Date(start);
        const endDate = new Date(end);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "Fechas inválidas",
          };
          return;
        }

        console.log(`[INFO] GET /ventas/fechas - ${start} a ${end}`);

        const ventas = await ventaController.getByDateRange({
          start: startDate,
          end: endDate,
        });

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          data: ventas,
        };
      } catch (error) {
        console.error("[ERROR] GET /ventas/fechas:", error);
        ctx.response.status = 500;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al buscar ventas por fecha",
        };
      }
    },
  );

  // ============================================
  // GET /ventas/sds/:sds - Obtener venta por SDS
  // ============================================
  router.get(
    "/ventas/sds/:sds",
    authMiddleware(userModel),
    async (ctx: Context) => {
      try {
        const { sds } = (ctx as any).params;

        console.log(`[INFO] GET /ventas/sds/${sds}`);

        const venta = await ventaController.getBySDS({ sds });

        if (!venta) {
          ctx.response.status = 404;
          ctx.response.body = {
            success: false,
            message: "Venta no encontrada",
          };
          return;
        }

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          data: venta,
        };
      } catch (error) {
        console.error("[ERROR] GET /ventas/sds:", error);
        ctx.response.status = 500;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al buscar venta por SDS",
        };
      }
    },
  );

  // ============================================
  // GET /ventas/sap/:sap - Obtener venta por SAP
  // ============================================
  router.get(
    "/ventas/sap/:sap",
    authMiddleware(userModel),
    async (ctx: Context) => {
      try {
        const { sap } = (ctx as any).params;

        console.log(`[INFO] GET /ventas/sap/${sap}`);

        const venta = await ventaController.getBySAP({ sap });

        if (!venta) {
          ctx.response.status = 404;
          ctx.response.body = {
            success: false,
            message: "Venta no encontrada",
          };
          return;
        }

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          data: venta,
        };
      } catch (error) {
        console.error("[ERROR] GET /ventas/sap:", error);
        ctx.response.status = 500;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al buscar venta por SAP",
        };
      }
    },
  );

  // ============================================
  // GET /ventas/vendedor/:vendedor - Obtener ventas por vendedor
  // ============================================
  router.get(
    "/ventas/vendedor/:vendedor",
    authMiddleware(userModel),
    async (ctx: Context) => {
      try {
        const { vendedor } = (ctx as any).params;

        console.log(`[INFO] GET /ventas/vendedor/${vendedor}`);

        const ventas = await ventaController.getByVendedor({ vendedor });

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          data: ventas,
        };
      } catch (error) {
        console.error("[ERROR] GET /ventas/vendedor:", error);
        ctx.response.status = 500;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al buscar ventas por vendedor",
        };
      }
    },
  );

  // ============================================
  // GET /ventas/cliente/:cliente - Obtener ventas por cliente
  // ============================================
  router.get(
    "/ventas/cliente/:cliente",
    authMiddleware(userModel),
    async (ctx: Context) => {
      try {
        const { cliente } = (ctx as any).params;

        console.log(`[INFO] GET /ventas/cliente/${cliente}`);

        const ventas = await ventaController.getByCliente({ cliente });

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          data: ventas,
        };
      } catch (error) {
        console.error("[ERROR] GET /ventas/cliente:", error);
        ctx.response.status = 500;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al buscar ventas por cliente",
        };
      }
    },
  );

  // ============================================
  // GET /ventas/plan/:plan - Obtener ventas por plan
  // ============================================
  router.get(
    "/ventas/plan/:plan",
    authMiddleware(userModel),
    async (ctx: Context) => {
      try {
        const plan = Number((ctx as any).params.plan);

        if (isNaN(plan)) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "ID de plan inválido",
          };
          return;
        }

        console.log(`[INFO] GET /ventas/plan/${plan}`);

        const ventas = await ventaController.getByPlan({ plan });

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          data: ventas,
        };
      } catch (error) {
        console.error("[ERROR] GET /ventas/plan:", error);
        ctx.response.status = 500;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al buscar ventas por plan",
        };
      }
    },
  );

  // ============================================
  // GET /ventas/:id - Obtener una venta por ID
  // ============================================
  router.get(
    "/ventas/:id",
    authMiddleware(userModel),
    async (ctx: Context) => {
      try {
        const { id } = (ctx as any).params;

        console.log(`[INFO] GET /ventas/${id}`);

        const venta = await ventaController.getById({ id });

        if (!venta) {
          ctx.response.status = 404;
          ctx.response.body = {
            success: false,
            message: "Venta no encontrada",
          };
          return;
        }

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          data: venta,
        };
      } catch (error) {
        console.error("[ERROR] GET /ventas/:id:", error);
        ctx.response.status = 500;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al obtener venta",
        };
      }
    },
  );

  // ============================================
  // POST /ventas - Crear una nueva venta
  // ============================================
  router.post("/ventas", authMiddleware(userModel), async (ctx: Context) => {
    try {
      const body = await ctx.request.body.json();

      console.log("[INFO] POST /ventas - Creando nueva venta");

      // Validar que el body tenga la estructura correcta
      if (!body.venta) {
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          message: "Estructura de datos inválida. Se requiere { venta: {...} }",
        };
        return;
      }

      // 1. CREAR CORREO SI ES SIM Y TIENE SAP
      console.log(body.venta.chip.toUpperCase());
      const tipoDeChip = body.venta.chip.toUpperCase();
      if (
        tipoDeChip === "SIM" &&
        body.venta.sap &&
        body.correo
      ) {
        try {
          const newCorreo = {
            sap_id: body.venta.sap.toUpperCase(),
            telefono_contacto: body.correo.telefono_contacto,
            telefono_alternativo: body.correo.telefono_alternativo || null,
            destinatario: body.correo.destinatario,
            persona_autorizada: body.correo.persona_autorizada || null,
            direccion: body.correo.direccion,
            numero_casa: body.correo.numero_casa || 0,
            entre_calles: body.correo.entre_calles || null,
            barrio: body.correo.barrio || null,
            localidad: body.correo.localidad,
            departamento: body.correo.departamento,
            codigo_postal: body.correo.codigo_postal,
            fecha_creacion: new Date(),
            fecha_limite: body.correo.fecha_limite
              ? new Date(body.correo.fecha_limite)
              : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días por defecto
          };

          const correo = await correoController.create(newCorreo);
          console.log(`[INFO] Correo creado: ${correo.sap_id}`);
        } catch (correoError) {
          console.error("[ERROR] Error al crear correo:", correoError);
          ctx.response.status = 500;
          ctx.response.body = {
            success: false,
            message: `Error al crear el correo: ${
              correoError instanceof Error
                ? correoError.message
                : "Error desconocido"
            }`,
          };
          return;
        }
      }

      console.log("ID:" + ctx.state.user.id);

      // 2. ASEGURAR QUE EL USUARIO ESTÉ EN TABLA VENDEDOR
      const userId = ctx.state.user.id;
      await client.execute(
        `INSERT IGNORE INTO vendedor (usuario_id) VALUES (?)`,
        [userId]
      );

      // 2. PREPARAR DATOS DE VENTA
      const newVenta: VentaCreate = {
        sds: body.venta.sds,
        chip: body.venta.chip,
        stl: body.venta.stl || null,
        tipo_venta: body.venta.tipo_venta,
        sap: body.venta.sap || null,
        cliente_id: body.venta.cliente_id,
        vendedor_id: ctx.state.user.id,
        multiple: body.venta.multiple || 0,
        plan_id: body.venta.plan_id,
        promocion_id: body.venta.promocion_id || null,
      };

      // 3. VALIDAR CON ZOD
      const result = VentaCreateSchema.safeParse(newVenta);

      if (!result.success) {
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          message: "Datos inválidos",
          errors: result.error.flatten(),
        };
        return;
      }

      // 4. VALIDAR COMPATIBILIDAD DE PLAN Y PROMOCIÓN
      let plan: Plan | undefined = undefined;
      if (result.data.plan_id) {
        plan = await planService.getById(result.data.plan_id.toString());
        if (!plan) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "Plan no encontrado",
          };
          return;
        }


      }

      // Validar promoción
      if (result.data.promocion_id) {
        const promocion = await promocionService.getById(
          result.data.promocion_id.toString(),
        );
        if (!promocion) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "Promocion no encontrada",
          };
          return;
        }

      // Validar compatibilidad con portabilidad (empresa de origen)
      if (
        result.data.tipo_venta === "PORTABILIDAD" && body.portabilidad &&
        plan && plan.empresa_destinada &&
        plan.empresa_destinada !== body.portabilidad.empresa_origen.toUpperCase()
      ) {
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          message:
            "El plan no corresponde a la empresa de origen de la portabilidad",
        };
        return;
      }

      // 5. CREAR VENTA
        const newVentaCreated = await ventaController.create({
          venta: result.data,
        });

        console.log(`[INFO] Venta creada: ${newVentaCreated.venta_id}`);

        // 6. CREAR PORTABILIDAD O LÍNEA NUEVA SEGÚN TIPO
        if (result.data.tipo_venta === "PORTABILIDAD") {
          if (!body.portabilidad) {
            ctx.response.status = 400;
            ctx.response.body = {
              success: false,
              message:
                "Datos de portabilidad requeridos para tipo PORTABILIDAD",
            };
            return;
          }

          const newPortabilidad: PortabilidadCreate = {
            venta: newVentaCreated.venta_id,
            spn: body.portabilidad.spn,
            empresa_origen: body.portabilidad.empresa_origen,
            mercado_origen: body.portabilidad.mercado_origen,
            numero_porta: body.portabilidad.numero_portar,
            pin: body.portabilidad.pin || null,
            numero_gestor: body.portabilidad.numero_gestor || null,
          };

          const newPortabilidadCreated = await portabilidadController.create({
            portabilidad: newPortabilidad,
          });
          if (!newPortabilidadCreated) {
            ctx.response.status = 500;
            ctx.response.body = {
              success: false,
              message: "Error al crear portabilidad",
            };
            return;
          }

          console.log(
            `[INFO] Portabilidad creada para venta ${newVentaCreated.venta_id}`,
          );
        } else if (result.data.tipo_venta === "LINEA_NUEVA") {
          const newLineaNueva: LineaNuevaCreate = {
            venta: newVentaCreated.venta_id,
          };

          const newLineaNuevaCreated = await lineaNuevaController.create({
            lineaNueva: newLineaNueva,
          });

          if (!newLineaNuevaCreated) {
            ctx.response.status = 500;
            ctx.response.body = {
              success: false,
              message: "Error al crear línea nueva",
            };
            return;
          }

          console.log(
            `[INFO] Línea nueva creada para venta ${newVentaCreated.venta_id}`,
          );
        }

        // 8. RESPONDER ÉXITO
        ctx.response.status = 201;
        ctx.response.body = {
          success: true,
          message: "Venta creada exitosamente",
          data: newVentaCreated,
        };
      }
    } catch (error) {
      console.error("[ERROR] POST /ventas:", error);
      ctx.response.status = 500;
      ctx.response.body = {
        success: false,
        message: error instanceof Error
          ? error.message
          : "Error al crear venta",
      };
    }
  });

  // ============================================
  // PUT /ventas/:id - Actualizar una venta
  // ============================================
  router.put(
    "/ventas/:id",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_ADMIN),
    async (ctx: Context) => {
      try {
        const { id } = (ctx as any).params;
        const body = await ctx.request.body.json();

        console.log(`[INFO] PUT /ventas/${id}`);

        const result = VentaUpdateSchema.safeParse(body.venta || body);

        if (!result.success) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: `Validación fallida: ${
              result.error.errors.map((error) => error.message).join(", ")
            }`,
          };
          return;
        }

        const updatedVenta = await ventaController.update({
          id,
          venta: result.data,
        });

        if (!updatedVenta) {
          ctx.response.status = 404;
          ctx.response.body = {
            success: false,
            message: "Venta no encontrada",
          };
          return;
        }

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          message: "Venta actualizada exitosamente",
          data: updatedVenta,
        };
      } catch (error) {
        console.error("[ERROR] PUT /ventas/:id:", error);
        ctx.response.status = 500;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al actualizar venta",
        };
      }
    },
  );

  // ============================================
  // DELETE /ventas/:id - Eliminar una venta
  // ============================================
  router.delete(
    "/ventas/:id",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_ADMIN),
    async (ctx: Context) => {
      try {
        const { id } = (ctx as any).params;

        console.log(`[INFO] DELETE /ventas/${id}`);

        const deleted = await ventaController.delete({ id });

        if (!deleted) {
          ctx.response.status = 404;
          ctx.response.body = {
            success: false,
            message: "Venta no encontrada",
          };
          return;
        }

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          message: "Venta eliminada correctamente",
        };
      } catch (error) {
        console.error("[ERROR] DELETE /ventas/:id:", error);
        ctx.response.status = 500;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al eliminar venta",
        };
      }
    },
  );

  return router;
}
