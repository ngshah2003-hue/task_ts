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
    ListNotFound: "List not found.",
    NotBoardOwner: "You do not have access to this board.",
};
class ListService {
    static async create(boardId, userId, body) {
        const board = await board_1.default.findOne({ _id: boardId, [constants_1.TableFields.owner]: userId });
        if (!board)
            throw new ValidationError_1.default(ValidationMsgs.NotBoardOwner);
        const title = (body.title ?? "").toString().trim();
        if (!title)
            throw new ValidationError_1.default("List title is required.");
        const maxOrder = await list_1.default.findOne({ [constants_1.TableFields.boardId]: boardId })
            .sort({ [constants_1.TableFields.order]: -1 })
            .select(constants_1.TableFields.order)
            .lean();
        const order = (maxOrder?.order ?? -1) + 1;
        const list = new list_1.default({
            [constants_1.TableFields.title]: title,
            [constants_1.TableFields.boardId]: boardId,
            [constants_1.TableFields.order]: order,
        });
        await list.save();
        return list;
    }
    static async update(boardId, listId, userId, body) {
        const board = await board_1.default.findOne({ _id: boardId, [constants_1.TableFields.owner]: userId });
        if (!board)
            throw new ValidationError_1.default(ValidationMsgs.NotBoardOwner);
        const list = await list_1.default.findOne({ _id: listId, [constants_1.TableFields.boardId]: boardId });
        if (!list)
            throw new ValidationError_1.default(ValidationMsgs.ListNotFound);
        if (body.title !== undefined)
            list.title = body.title.trim();
        if (body.order !== undefined)
            list.order = body.order;
        await list.save();
        return list;
    }
    static async delete(boardId, listId, userId) {
        const board = await board_1.default.findOne({ _id: boardId, [constants_1.TableFields.owner]: userId });
        if (!board)
            throw new ValidationError_1.default(ValidationMsgs.NotBoardOwner);
        const list = await list_1.default.findOne({ _id: listId, [constants_1.TableFields.boardId]: boardId });
        if (!list)
            throw new ValidationError_1.default(ValidationMsgs.ListNotFound);
        await card_1.default.deleteMany({ [constants_1.TableFields.listId]: listId });
        await list_1.default.deleteOne({ _id: listId });
    }
}
exports.default = ListService;
//# sourceMappingURL=ListService.js.map