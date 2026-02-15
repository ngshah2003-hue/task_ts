"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listByBoard = listByBoard;
exports.listForUser = listForUser;
const ActivityService_1 = __importDefault(require("../db/services/ActivityService"));
async function listByBoard(req) {
    const userId = req.user._id;
    const boardId = req.params.boardId;
    const page = req.query.page != null ? Math.max(1, parseInt(String(req.query.page), 10) || 1) : 1;
    const limit = req.query.limit != null ? Math.min(50, Math.max(1, parseInt(String(req.query.limit), 10) || 20)) : 20;
    const result = await ActivityService_1.default.listByBoard(boardId, userId, page, limit);
    return result;
}
async function listForUser(req) {
    const userId = req.user._id;
    const page = req.query.page != null ? Math.max(1, parseInt(String(req.query.page), 10) || 1) : 1;
    const limit = req.query.limit != null ? Math.min(50, Math.max(1, parseInt(String(req.query.limit), 10) || 20)) : 20;
    return ActivityService_1.default.listForUser(userId, page, limit);
}
//# sourceMappingURL=ActivityController.js.map