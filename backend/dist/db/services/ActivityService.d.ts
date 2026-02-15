import { ActivityActionTypes } from "../models/activity";
import type mongoose from "mongoose";
export interface LogActivityParams {
    boardId: string | mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    actionType: string;
    cardId?: mongoose.Types.ObjectId;
    cardTitle?: string;
    listId?: mongoose.Types.ObjectId;
    listTitle?: string;
    fromListTitle?: string;
    toListTitle?: string;
}
export interface ActivityItem {
    _id: mongoose.Types.ObjectId;
    boardId: mongoose.Types.ObjectId;
    userId: {
        _id: mongoose.Types.ObjectId;
        name?: string;
        email?: string;
    };
    actionType: string;
    cardTitle?: string;
    listTitle?: string;
    fromListTitle?: string;
    toListTitle?: string;
    createdAt: Date;
}
export default class ActivityService {
    static log(params: LogActivityParams): Promise<void>;
    static listByBoard(boardId: string, userId: mongoose.Types.ObjectId, page?: number, limit?: number): Promise<{
        activities: ActivityItem[];
        total: number;
        totalPages: number;
    }>;
    static listForUser(userId: mongoose.Types.ObjectId, page?: number, limit?: number): Promise<{
        activities: (ActivityItem & {
            boardId?: {
                _id: mongoose.Types.ObjectId;
                title?: string;
            };
        })[];
        total: number;
        totalPages: number;
    }>;
}
export { ActivityActionTypes };
//# sourceMappingURL=ActivityService.d.ts.map