import { Venta } from "../schemas/venta/Venta.ts";
import { ModelDB } from "./model.ts";

export interface VentaModelDB extends ModelDB<Venta> {
  getBySDS: ({ sds }: { sds: string }) => Promise<Venta | undefined>;

  getBySPN: ({ spn }: { spn: string }) => Promise<Venta | undefined>;

  getBySAP: ({ sap }: { sap: string }) => Promise<Venta | undefined>;
}
