import { Request, Response, NextFunction } from 'express';
import type { UserModelDB } from '../interface/Usuario.ts';
export declare const validateActivePasswordMiddleware: (model: UserModelDB) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const preventOldPasswordAccessMiddleware: (model: UserModelDB) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=passwordMiddleware.d.ts.map