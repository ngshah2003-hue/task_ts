"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = create;
exports.update = update;
exports.remove = remove;
exports.move = move;
exports.listByBoard = listByBoard;
const ValidationError_1 = __importDefault(require("../utils/ValidationError"));
const CardService_1 = __importDefault(require("../db/services/CardService"));
async function create(req) {
    const userId = req.user._id;
    const { boardId, listId } = req.params;
    const card = await CardService_1.default.create(boardId, listId, userId, req.body);
    return { card };
}
async function update(req) {
    const userId = req.user._id;
    const card = await CardService_1.default.update(req.params.cardId, userId, req.body);
    return { card };
}
async function remove(req) {
    const userId = req.user._id;
    await CardService_1.default.delete(req.params.cardId, userId);
    return { success: true };
}
async function move(req) {
    const userId = req.user._id;
    const { listId, position } = req.body;
    if (listId == null)
        throw new ValidationError_1.default("listId is required.");
    const positionNum = typeof position === "number" ? position : parseInt(String(position), 10);
    if (Number.isNaN(positionNum) || positionNum < 0)
        throw new ValidationError_1.default("position must be a non-negative number.");
    const card = await CardService_1.default.move(req.params.cardId, userId, listId, positionNum);
    return { card };
}
async function listByBoard(req) {
    const userId = req.user._id;
    const { boardId } = req.params;
    const page = req.query.page ? parseInt(String(req.query.page), 10) : undefined;
    const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : undefined;
    const status = req.query.status ? String(req.query.status) : undefined;
    const q = req.query.q ? String(req.query.q) : undefined;
    const result = await CardService_1.default.listByBoard(boardId, userId, { page, limit, status, q });
    return result;
}
//# sourceMappingURL=CardController.js.map