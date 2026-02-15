"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.list = list;
exports.getOne = getOne;
exports.create = create;
exports.remove = remove;
const ValidationError_1 = __importDefault(require("../utils/ValidationError"));
const BoardService_1 = __importDefault(require("../db/services/BoardService"));
async function list(req) {
    const userId = req.user._id;
    const boards = await BoardService_1.default.listByOwner(userId);
    return { boards, total: boards.length };
}
async function getOne(req) {
    const userId = req.user._id;
    const boardId = req.params.boardId;
    const q = req.query.q != null ? String(req.query.q).trim() : undefined;
    const status = req.query.status != null ? String(req.query.status).trim() : undefined;
    const listPage = req.query.listPage != null ? Math.max(1, parseInt(String(req.query.listPage), 10) || 1) : 1;
    const listLimit = req.query.listLimit != null ? Math.max(0, parseInt(String(req.query.listLimit), 10) || 0) : 0;
    const result = await BoardService_1.default.getBoardWithListsAndCards(boardId, userId, { q, status }, { page: listPage, limit: listLimit });
    if (!result)
        throw new ValidationError_1.default("Board not found.");
    return result;
}
async function create(req) {
    const userId = req.user._id;
    const board = await BoardService_1.default.create(userId, req.body);
    return { board };
}
async function remove(req) {
    const userId = req.user._id;
    await BoardService_1.default.delete(req.params.boardId, userId);
    return { success: true };
}
//# sourceMappingURL=BoardController.js.map