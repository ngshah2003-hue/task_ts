"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = create;
exports.update = update;
exports.remove = remove;
const ListService_1 = __importDefault(require("../db/services/ListService"));
async function create(req) {
    const userId = req.user._id;
    const { boardId } = req.params;
    const list = await ListService_1.default.create(boardId, userId, req.body);
    return { list };
}
async function update(req) {
    const userId = req.user._id;
    const { boardId, listId } = req.params;
    const list = await ListService_1.default.update(boardId, listId, userId, req.body);
    return { list };
}
async function remove(req) {
    const userId = req.user._id;
    const { boardId, listId } = req.params;
    await ListService_1.default.delete(boardId, listId, userId);
    return { success: true };
}
//# sourceMappingURL=ListController.js.map