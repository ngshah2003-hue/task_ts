import { Request } from "express";
export declare function listByBoard(req: Request): Promise<{
    activities: import("../db/services/ActivityService").ActivityItem[];
    total: number;
    totalPages: number;
}>;
export declare function listForUser(req: Request): Promise<{
    activities: (import("../db/services/ActivityService").ActivityItem & {
        boardId?: {
            _id: import("mongoose").Types.ObjectId;
            title?: string;
        };
    })[];
    total: number;
    totalPages: number;
}>;
//# sourceMappingURL=ActivityController.d.ts.map