import type mongoose from "mongoose";
import type { IBoardDoc } from "../models/board";
import type { ICardDoc } from "../models/card";
export default class BoardService {
    static listByOwner(userId: mongoose.Types.ObjectId): Promise<IBoardDoc[]>;
    static getById(boardId: string, userId: mongoose.Types.ObjectId): Promise<IBoardDoc | null>;
    static getBoardWithListsAndCards(boardId: string, userId: mongoose.Types.ObjectId, filters?: {
        q?: string;
        status?: string;
    }, listPagination?: {
        page: number;
        limit: number;
    }): Promise<{
        board: IBoardDoc;
        lists: Array<{
            _id: mongoose.Types.ObjectId;
            title: string;
            boardId: mongoose.Types.ObjectId;
            order: number;
            cards: ICardDoc[];
        }>;
        totalLists: number;
        totalPages: number;
    } | null>;
    static create(userId: mongoose.Types.ObjectId, body: {
        title: string;
    }): Promise<IBoardDoc>;
    static delete(boardId: string, userId: mongoose.Types.ObjectId): Promise<void>;
    static assertOwnership(boardId: string, userId: mongoose.Types.ObjectId): Promise<IBoardDoc>;
}
//# sourceMappingURL=BoardService.d.ts.map