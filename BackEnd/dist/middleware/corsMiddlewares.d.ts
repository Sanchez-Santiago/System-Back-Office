import { Request, Response, NextFunction } from 'express';
export declare const corsMiddleware: (req: Request, res: Response, next: NextFunction) => void;
export declare const timingMiddleware: (req: Request, res: Response, next: NextFunction) => void;
export declare const errorMiddleware: (err: Error, req: Request, res: Response, next: NextFunction) => void;
export declare const loggerMiddleware: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=corsMiddlewares.d.ts.map