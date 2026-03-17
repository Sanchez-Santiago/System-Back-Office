import client from "../../database/MySQL.ts";
import { LineaNuevaModelDB } from "../../interface/LineaNueva.ts";
import { LineaNueva, LineaNuevaCreate } from "../../schemas/venta/LineaNueva.ts";
export declare class LineaNuevaMySQL implements LineaNuevaModelDB {
    connection: typeof client;
    constructor(connection: typeof client);
    getAll(params?: {
        page?: number;
        limit?: number;
    }): Promise<LineaNueva[]>;
    getById({ id }: {
        id: number;
    }): Promise<LineaNueva | undefined>;
    add({ input }: {
        input: LineaNuevaCreate;
    }): Promise<LineaNueva>;
    update({ id, input }: {
        id: number;
        input: Partial<LineaNueva>;
    }): Promise<LineaNueva | undefined>;
    delete({ id }: {
        id: number;
    }): Promise<boolean>;
    getByVenta({ venta }: {
        venta: number;
    }): Promise<LineaNueva | undefined>;
    getStatistics(): Promise<{
        total: number;
    }>;
    getByEstado({ estado }: {
        estado: string;
    }): Promise<LineaNueva[]>;
}
//# sourceMappingURL=lineaNuevaMySQL.d.ts.map