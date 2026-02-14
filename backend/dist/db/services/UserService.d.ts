import type { IUserDoc } from "../../types";
type Projection = Record<string, 1>;
declare class ProjectionBuilder {
    private methodToExecute;
    private projection;
    constructor(methodToExecute: (this: Projection) => Promise<IUserDoc | null>);
    withBasicInfo(): this;
    withPassword(): this;
    withUserType(): this;
    execute(): Promise<IUserDoc | null>;
}
export default class UserService {
    static findByEmail(email: string): ProjectionBuilder;
    static getUserByIdAndToken(userId: string, token: string): ProjectionBuilder;
    static saveAuthToken(userId: import("mongoose").Types.ObjectId, token: string): Promise<void>;
    static removeAuth(userId: import("mongoose").Types.ObjectId, authToken: string): Promise<void>;
    static insertUserRecord(reqBody: Record<string, unknown>): Promise<IUserDoc>;
}
export {};
//# sourceMappingURL=UserService.d.ts.map