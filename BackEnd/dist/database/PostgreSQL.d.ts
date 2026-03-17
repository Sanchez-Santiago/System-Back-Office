import { Pool } from 'pg';
export declare class PostgresClient {
    private pool;
    private connected;
    constructor();
    private initPool;
    connect(): Promise<void>;
    query(sql: string, params?: any[]): Promise<any[]>;
    getNativeClient(): Pool;
    getClient(): Pool;
    isConnected(): boolean;
    close(): Promise<void>;
}
export declare function getPostgresClient(): PostgresClient;
export default PostgresClient;
//# sourceMappingURL=PostgreSQL.d.ts.map