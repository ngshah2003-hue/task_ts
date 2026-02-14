import { Request } from "express";
import type { IAdminDoc } from "../types";
export declare function signup(req: Request): Promise<{
    user: IAdminDoc;
    token: string;
}>;
export declare function login(req: Request): Promise<{
    user: IAdminDoc;
    token: string;
}>;
export declare function logout(req: Request): Promise<{
    message: string;
}>;
export declare function me(req: Request): Promise<{
    user: NonNullable<Request["user"]>;
}>;
//# sourceMappingURL=AuthController.d.ts.map