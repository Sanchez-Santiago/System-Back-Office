import { Request, Response, NextFunction } from 'express';
export declare function handleServiceDegradedError(error: Error, res: Response): boolean;
export declare function handleConnectionError(error: Error, res: Response): boolean;
export declare const errorHandlerMiddleware: (err: Error, req: Request, res: Response, next: NextFunction) => void;
export declare function withErrorHandling<T extends any[], R>(handler: (...args: T) => Promise<R>): (...args: T) => Promise<R>;
//# sourceMappingURL=errorHandlingMiddleware.d.ts.map