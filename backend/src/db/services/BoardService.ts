import { TableFields } from "../../utils/constants";
import ValidationError from "../../utils/ValidationError";
import Board from "../models/board";
import List from "../models/list";
import Card from "../models/card";
import type mongoose from "mongoose";
import type { IBoardDoc } from "../models/board";
import type { ICardDoc } from "../models/card";

const ValidationMsgs = {
  BoardNotFound: "Board not found.",
  NotBoardOwner: "You do not have access to this board.",
};

export default class BoardService {
  static async listByOwner(userId: mongoose.Types.ObjectId): Promise<IBoardDoc[]> {
    return Board.find({ [TableFields.owner]: userId }).sort({ createdAt: -1 }).lean();
  }

  static async getById(boardId: string, userId: mongoose.Types.ObjectId): Promise<IBoardDoc | null> {
    const board = await Board.findOne({ _id: boardId, [TableFields.owner]: userId });
    return board;
  }

  static async getBoardWithListsAndCards(
    boardId: string,
    userId: mongoose.Types.ObjectId,
    filters?: { q?: string; status?: string },
    listPagination?: { page: number; limit: number },
  ): Promise<{
    board: IBoardDoc;
    lists: Array<{ _id: mongoose.Types.ObjectId; title: string; boardId: mongoose.Types.ObjectId; order: number; cards: ICardDoc[] }>;
    totalLists: number;
    totalPages: number;
  } | null> {
    const board = await Board.findOne({ _id: boardId, [TableFields.owner]: userId });
    if (!board) return null;
    const totalLists = await List.countDocuments({ [TableFields.boardId]: boardId });
    const page = listPagination?.page ?? 1;
    const limit = listPagination?.limit ?? 0;
    const limitCap = limit <= 0 ? 500 : Math.min(limit, 500);
    const skip = (Math.max(1, page) - 1) * limitCap;
    const lists = await List.find({ [TableFields.boardId]: boardId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitCap)
      .lean();
    const totalPages = limitCap >= totalLists ? 1 : Math.ceil(totalLists / limitCap);
    const listIds = lists.map((l) => l._id);
    const cardFilter: Record<string, unknown> = { [TableFields.listId]: { $in: listIds } };
    if (filters?.status && filters.status.trim()) {
      cardFilter[TableFields.status] = filters.status.trim();
    }
    if (filters?.q && filters.q.trim()) {
      cardFilter[TableFields.title] = new RegExp(escapeRegex(filters.q.trim()), "i");
    }
    const cards = await Card.find(cardFilter).sort({ [TableFields.order]: 1 });
    const cardsByList = new Map<string, ICardDoc[]>();
    for (const c of cards) {
      const lid = c.listId.toString();
      if (!cardsByList.has(lid)) cardsByList.set(lid, []);
      cardsByList.get(lid)!.push(c);
    }
    const listsWithCards = lists.map((list) => ({
      _id: list._id,
      title: list.title,
      boardId: list.boardId,
      order: list.order,
      cards: cardsByList.get(list._id.toString()) ?? [],
    }));
    return { board, lists: listsWithCards, totalLists, totalPages };
  }

  static async create(
    userId: mongoose.Types.ObjectId,
    body: { title: string },
  ): Promise<IBoardDoc> {
    const title = (body.title ?? "").toString().trim();
    if (!title) throw new ValidationError("Board title is required.");
    const board = new Board({
      [TableFields.title]: title,
      [TableFields.owner]: userId,
    });
    await board.save();
    return board;
  }

  static async delete(boardId: string, userId: mongoose.Types.ObjectId): Promise<void> {
    const board = await Board.findOne({ _id: boardId, [TableFields.owner]: userId });
    if (!board) throw new ValidationError(ValidationMsgs.BoardNotFound);
    const listIds = (await List.find({ [TableFields.boardId]: boardId }).distinct("_id")) as mongoose.Types.ObjectId[];
    await Card.deleteMany({ [TableFields.listId]: { $in: listIds } });
    await List.deleteMany({ [TableFields.boardId]: boardId });
    await Board.deleteOne({ _id: boardId });
  }

  static async assertOwnership(
    boardId: string,
    userId: mongoose.Types.ObjectId,
  ): Promise<IBoardDoc> {
    const board = await Board.findOne({ _id: boardId, [TableFields.owner]: userId });
    if (!board) throw new ValidationError(ValidationMsgs.NotBoardOwner);
    return board;
  }
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
