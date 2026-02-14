import type { IAdminDoc } from "../../types";
type Projection = Record<string, 1>;
declare class ProjectionBuilder {
    private methodToExecute;
    private projection;
    constructor(methodToExecute: (this: Projection) => Promise<IAdminDoc | null>);
    withBasicInfo(): this;
    withPassword(): this;
    withUserType(): this;
    withApproved(): this;
    execute(): Promise<IAdminDoc | null>;
}
export default class AdminService {
    static findByEmail(email: string): ProjectionBuilder;
    static getUserByIdAndToken(adminId: string, token: string): ProjectionBuilder;
    static saveAuthToken(adminId: import("mongoose").Types.ObjectId, token: string): Promise<void>;
    static removeAuth(adminId: import("mongoose").Types.ObjectId, authToken: string): Promise<void>;
    static insertUserRecord(reqBody: Record<string, unknown>): Promise<IAdminDoc>;
}
export {};
//# sourceMappingURL=AdminService.d.ts.map