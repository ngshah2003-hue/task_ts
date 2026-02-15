"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../utils/constants");
const ValidationError_1 = __importDefault(require("../../utils/ValidationError"));
const board_1 = __importDefault(require("../models/board"));
const list_1 = __importDefault(require("../models/list"));
const card_1 = __importDefault(require("../models/card"));
const ValidationMsgs = {
    BoardNotFound: "Board not found.",
    NotBoardOwner: "You do not have access to this board.",
};
class BoardService {
    static async listByOwner(userId) {
        return board_1.default.find({ [constants_1.TableFields.owner]: userId }).sort({ createdAt: -1 }).lean();
    }
    static async getById(boardId, userId) {
        const board = await board_1.default.findOne({ _id: boardId, [constants_1.TableFields.owner]: userId });
        return board;
    }
    static async getBoardWithListsAndCards(boardId, userId, filters, listPagination) {
        const board = await board_1.default.findOne({ _id: boardId, [constants_1.TableFields.owner]: userId });
        if (!board)
            return null;
        const totalLists = await list_1.default.countDocuments({ [constants_1.TableFields.boardId]: boardId });
        const page = listPagination?.page ?? 1;
        const limit = listPagination?.limit ?? 0;
        const limitCap = limit <= 0 ? 500 : Math.min(limit, 500);
        const skip = (Math.max(1, page) - 1) * limitCap;
        const lists = await list_1.default.find({ [constants_1.TableFields.boardId]: boardId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitCap)
            .lean();
        const totalPages = limitCap >= totalLists ? 1 : Math.ceil(totalLists / limitCap);
        const listIds = lists.map((l) => l._id);
        const cardFilter = { [constants_1.TableFields.listId]: { $in: listIds } };
        if (filters?.status && filters.status.trim()) {
            cardFilter[constants_1.TableFields.status] = filters.status.trim();
        }
        if (filters?.q && filters.q.trim()) {
            cardFilter[constants_1.TableFields.title] = new RegExp(escapeRegex(filters.q.trim()), "i");
        }
        const cards = await card_1.default.find(cardFilter).sort({ [constants_1.TableFields.order]: 1 });
        const cardsByList = new Map();
        for (const c of cards) {
            const lid = c.listId.toString();
            if (!cardsByList.has(lid))
                cardsByList.set(lid, []);
            cardsByList.get(lid).push(c);
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
    static async create(userId, body) {
        const title = (body.title ?? "").toString().trim();
        if (!title)
            throw new ValidationError_1.default("Board title is required.");
        const board = new board_1.default({
            [constants_1.TableFields.title]: title,
            [constants_1.TableFields.owner]: userId,
        });
        await board.save();
        return board;
    }
    static async delete(boardId, userId) {
        const board = await board_1.default.findOne({ _id: boardId, [constants_1.TableFields.owner]: userId });
        if (!board)
            throw new ValidationError_1.default(ValidationMsgs.BoardNotFound);
        const listIds = (await list_1.default.find({ [constants_1.TableFields.boardId]: boardId }).distinct("_id"));
        await card_1.default.deleteMany({ [constants_1.TableFields.listId]: { $in: listIds } });
        await list_1.default.deleteMany({ [constants_1.TableFields.boardId]: boardId });
        await board_1.default.deleteOne({ _id: boardId });
    }
    static async assertOwnership(boardId, userId) {
        const board = await board_1.default.findOne({ _id: boardId, [constants_1.TableFields.owner]: userId });
        if (!board)
            throw new ValidationError_1.default(ValidationMsgs.NotBoardOwner);
        return board;
    }
}
exports.default = BoardService;
function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
//# sourceMappingURL=BoardService.js.map