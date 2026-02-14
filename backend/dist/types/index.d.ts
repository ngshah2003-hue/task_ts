import type { Document } from "mongoose";
export interface IUserDoc extends Document {
    _id: import("mongoose").Types.ObjectId;
    name?: string;
    email: string;
    password: string;
    tokens: Array<{
        token: string;
    }>;
    userType: number;
    active: boolean;
    isValidAuth(password: string): Promise<boolean>;
    isValidPassword(password: string): boolean;
    createAuthToken(interfaceType?: string): string;
}
export interface IAdminDoc extends Document {
    _id: import("mongoose").Types.ObjectId;
    name?: string;
    email: string;
    password: string;
    tokens: Array<{
        token: string;
    }>;
    userType: number;
    approved: boolean;
    active: boolean;
    isValidAuth(password: string): Promise<boolean>;
    isValidPassword(password: string): boolean;
    createAuthToken(): string;
    createPasswordResetToken(): string;
}
declare global {
    namespace Express {
        interface Request {
            user?: IUserDoc | IAdminDoc;
            interface?: string;
        }
    }
}
export {};
//# sourceMappingURL=index.d.ts.map