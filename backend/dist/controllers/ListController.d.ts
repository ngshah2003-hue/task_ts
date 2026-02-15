import { Request } from "express";
export declare function create(req: Request): Promise<{
    list: import("../db/models/list").IListDoc;
}>;
export declare function update(req: Request): Promise<{
    list: import("../db/models/list").IListDoc;
}>;
export declare function remove(req: Request): Promise<{
    success: boolean;
}>;
//# sourceMappingURL=ListController.d.ts.map