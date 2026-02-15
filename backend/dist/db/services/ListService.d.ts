import type mongoose from "mongoose";
import type { IListDoc } from "../models/list";
export default class ListService {
    static create(boardId: string, userId: mongoose.Types.ObjectId, body: {
        title: string;
    }): Promise<IListDoc>;
    static update(boardId: string, listId: string, userId: mongoose.Types.ObjectId, body: {
        title?: string;
        order?: number;
    }): Promise<IListDoc>;
    static delete(boardId: string, listId: string, userId: mongoose.Types.ObjectId): Promise<void>;
}
//# sourceMappingURL=ListService.d.ts.map