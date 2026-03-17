export declare function parseUploadedFile(file: File): Promise<any>;
export declare function parseUploadedFileAdvanced(file: File): Promise<{
    type: string;
    filename: string;
    rowCount: any;
    data: any;
    sheetNames?: undefined;
    activeSheet?: undefined;
} | {
    type: string;
    filename: string;
    sheetNames: string[];
    activeSheet: string;
    rowCount: number;
    data: unknown[];
}>;
export declare function detectCSVSeparator(csvContent: string): string;
//# sourceMappingURL=Csv.d.ts.map