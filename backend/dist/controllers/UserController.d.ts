import { Request } from "express";
import type { IUserDoc } from "../types";
export declare function signup(req: Request): Promise<{
    user: IUserDoc;
    token: string;
}>;
export declare function login(req: Request): Promise<{
    user: IUserDoc;
    token: string;
}>;
export declare function logout(req: Request): Promise<{
    message: string;
}>;
export declare function me(req: Request): Promise<{
    user: NonNullable<Request["user"]>;
}>;
//# sourceMappingURL=UserController.d.ts.map