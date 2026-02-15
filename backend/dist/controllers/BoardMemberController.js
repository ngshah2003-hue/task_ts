"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.invite = invite;
exports.listMembers = listMembers;
exports.acceptInvite = acceptInvite;
exports.removeMember = removeMember;
exports.cancelInvite = cancelInvite;
const ValidationError_1 = __importDefault(require("../utils/ValidationError"));
const BoardService_1 = __importDefault(require("../db/services/BoardService"));
async function invite(req) {
    const userId = req.user._id;
    const boardId = req.params.boardId;
    const email = req.body?.email;
    if (!email || typeof email !== "string")
        throw new ValidationError_1.default("Email is required.");
    const result = await BoardService_1.default.invite(boardId, email, userId);
    return { ...result, message: "Invitation sent." };
}
async function listMembers(req) {
    const userId = req.user._id;
    const boardId = req.params.boardId;
    return BoardService_1.default.listMembersAndInvites(boardId, userId);
}
async function acceptInvite(req) {
    const userId = req.user._id;
    const token = req.body?.token ?? req.query?.token;
    if (!token || typeof token !== "string")
        throw new ValidationError_1.default("Token is required.");
    return BoardService_1.default.acceptInvite(token, userId);
}
async function removeMember(req) {
    const byUserId = req.user._id;
    const boardId = req.params.boardId;
    const memberUserId = req.params.userId;
    await BoardService_1.default.removeMember(boardId, memberUserId, byUserId);
    return { success: true };
}
async function cancelInvite(req) {
    const byUserId = req.user._id;
    const boardId = req.params.boardId;
    const invitationId = req.params.invitationId;
    await BoardService_1.default.cancelInvite(boardId, invitationId, byUserId);
    return { success: true };
}
//# sourceMappingURL=BoardMemberController.js.map