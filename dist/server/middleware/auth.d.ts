import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { User } from '@/types';
declare global {
    namespace Express {
        interface User {
            id: number;
            discord_id: string;
            username: string;
            discriminator: string;
            avatar?: string;
            email?: string;
            created_at: Date;
            updated_at: Date;
        }
        interface Request {
            user?: User;
        }
    }
}
export declare function generateToken(user: User): string;
export declare function verifyToken(req: Request, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
export declare function optionalAuth(req: Request, res: Response, next: NextFunction): void;
export default passport;
//# sourceMappingURL=auth.d.ts.map