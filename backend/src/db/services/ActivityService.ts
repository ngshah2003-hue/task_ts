import { TableFields } from "../../utils/constants";
import Activity, { ActivityActionTypes } from "../models/activity";
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
  userId: { _id: mongoose.Types.ObjectId; name?: string; email?: string };
  actionType: string;
  cardTitle?: string;
  listTitle?: string;
  fromListTitle?: string;
  toListTitle?: string;
  createdAt: Date;
}

export default class ActivityService {
  static async log(params: LogActivityParams): Promise<void> {
    const doc: Record<string, unknown> = {
      [TableFields.boardId]: params.boardId,
      [TableFields.userId]: params.userId,
      [TableFields.actionType]: params.actionType,
    };
    if (params.cardId != null) doc[TableFields.cardId] = params.cardId;
    if (params.cardTitle != null) doc[TableFields.cardTitle] = params.cardTitle;
    if (params.listId != null) doc[TableFields.listId] = params.listId;
    if (params.listTitle != null) doc[TableFields.listTitle] = params.listTitle;
    if (params.fromListTitle != null) doc[TableFields.fromListTitle] = params.fromListTitle;
    if (params.toListTitle != null) doc[TableFields.toListTitle] = params.toListTitle;
    await Activity.create(doc);
  }

  static async listByBoard(
    boardId: string,
    userId: mongoose.Types.ObjectId,
    page: number = 1,
    limit: number = 30,
  ): Promise<{ activities: ActivityItem[]; total: number; totalPages: number }> {
    const BoardService = (await import("./BoardService")).default;
    const board = await BoardService.getById(boardId, userId);
    if (!board) return { activities: [], total: 0, totalPages: 0 };
    const skip = (Math.max(1, page) - 1) * Math.min(50, Math.max(1, limit));
    const cap = Math.min(50, Math.max(1, limit));
    const [activities, total] = await Promise.all([
      Activity.find({ [TableFields.boardId]: boardId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(cap)
        .populate(TableFields.userId, "name email")
        .lean(),
      Activity.countDocuments({ [TableFields.boardId]: boardId }),
    ]);
    return {
      activities: activities as ActivityItem[],
      total,
      totalPages: Math.ceil(total / cap) || 1,
    };
  }

  static async listForUser(
    userId: mongoose.Types.ObjectId,
    page: number = 1,
    limit: number = 30,
  ): Promise<{ activities: (ActivityItem & { boardId?: { _id: mongoose.Types.ObjectId; title?: string } })[]; total: number; totalPages: number }> {
    const BoardService = (await import("./BoardService")).default;
    const boards = await BoardService.listByOwner(userId);
    const boardIds = boards.map((b) => b._id);
    if (boardIds.length === 0) return { activities: [], total: 0, totalPages: 0 };
    const skip = (Math.max(1, page) - 1) * Math.min(50, Math.max(1, limit));
    const cap = Math.min(50, Math.max(1, limit));
    const [activities, total] = await Promise.all([
      Activity.find({ [TableFields.boardId]: { $in: boardIds } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(cap)
        .populate(TableFields.userId, "name email")
        .populate(TableFields.boardId, "title")
        .lean(),
      Activity.countDocuments({ [TableFields.boardId]: { $in: boardIds } }),
    ]);
    return {
      activities: activities as (ActivityItem & { boardId?: { _id: mongoose.Types.ObjectId; title?: string } })[],
      total,
      totalPages: Math.ceil(total / cap) || 1,
    };
  }
}

export { ActivityActionTypes };
