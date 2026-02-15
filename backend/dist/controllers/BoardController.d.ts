import { Request } from "express";
export declare function list(req: Request): Promise<{
    boards: import("../db/models/board").IBoardDoc[];
    total: number;
}>;
export declare function getOne(req: Request): Promise<{
    board: import("../db/models/board").IBoardDoc;
    lists: Array<{
        _id: import("mongoose").Types.ObjectId;
        title: string;
        boardId: import("mongoose").Types.ObjectId;
        order: number;
        cards: import("../db/models/card").ICardDoc[];
    }>;
    totalLists: number;
    totalPages: number;
}>;
export declare function create(req: Request): Promise<{
    board: import("../db/models/board").IBoardDoc;
}>;
export declare function remove(req: Request): Promise<{
    success: boolean;
}>;
//# sourceMappingURL=BoardController.d.ts.map