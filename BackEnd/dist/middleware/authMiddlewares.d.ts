import { Request, Response, NextFunction } from 'express';
import 'dotenv/config';
import { UserModelDB } from '../interface/Usuario.ts';
export declare const authMiddleware: (model: UserModelDB) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=authMiddlewares.d.ts.map