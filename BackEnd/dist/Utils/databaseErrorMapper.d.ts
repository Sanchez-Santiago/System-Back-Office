interface MappedError {
    message: string;
    statusCode: number;
}
export declare function mapDatabaseError(error: unknown, isDevelopment: boolean): MappedError | null;
export {};
//# sourceMappingURL=databaseErrorMapper.d.ts.map