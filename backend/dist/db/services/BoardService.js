"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const constants_1 = require("../../utils/constants");
const ValidationError_1 = __importDefault(require("../../utils/ValidationError"));
const board_1 = __importDefault(require("../models/board"));
const list_1 = __importDefault(require("../models/list"));
const card_1 = __importDefault(require("../models/card"));
const boardMember_1 = __importDefault(require("../models/boardMember"));
const boardInvitation_1 = __importDefault(require("../models/boardInvitation"));
const user_1 = __importDefault(require("../models/user"));
const activity_1 = __importDefault(require("../models/activity"));
const ValidationMsgs = {
    BoardNotFound: "Board not found.",
    NotBoardOwner: "You do not have access to this board.",
    InviteNotFound: "Invitation not found or expired.",
    AlreadyMember: "User is already a member or has a pending invite.",
};
const INVITE_EXPIRY_DAYS = 7;
class BoardService {
    static async canAccessBoard(boardId, userId) {
        const board = await board_1.default.findById(boardId);
        if (!board)
            return null;
        if (board.owner.toString() === userId.toString())
            return board;
        const member = await boardMember_1.default.findOne({ [constants_1.TableFields.boardId]: boardId, [constants_1.TableFields.userId]: userId });
        return member ? board : null;
    }
    static async listByOwner(userId) {
        const memberBoardIds = (await boardMember_1.default.find({ [constants_1.TableFields.userId]: userId }).distinct(constants_1.TableFields.boardId));
        return board_1.default.find({
            $or: [{ [constants_1.TableFields.owner]: userId }, { _id: { $in: memberBoardIds } }],
        })
            .sort({ createdAt: -1 })
            .lean();
    }
    static async getById(boardId, userId) {
        return this.canAccessBoard(boardId, userId);
    }
    static async getBoardWithListsAndCards(boardId, userId, filters, listPagination) {
        const board = await this.canAccessBoard(boardId, userId);
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
        await boardMember_1.default.deleteMany({ [constants_1.TableFields.boardId]: boardId });
        await boardInvitation_1.default.deleteMany({ [constants_1.TableFields.boardId]: boardId });
        await activity_1.default.deleteMany({ [constants_1.TableFields.boardId]: boardId });
        await board_1.default.deleteOne({ _id: boardId });
    }
    static async assertCanAccess(boardId, userId) {
        const board = await this.canAccessBoard(boardId, userId);
        if (!board)
            throw new ValidationError_1.default(ValidationMsgs.NotBoardOwner);
        return board;
    }
    static async invite(boardId, email, invitedByUserId) {
        await this.assertCanAccess(boardId, invitedByUserId);
        const board = await board_1.default.findById(boardId);
        if (!board)
            throw new ValidationError_1.default(ValidationMsgs.BoardNotFound);
        const normalizedEmail = email.trim().toLowerCase();
        if (!normalizedEmail)
            throw new ValidationError_1.default("Email is required.");
        const user = await user_1.default.findOne({ email: normalizedEmail });
        if (user) {
            const isMember = await boardMember_1.default.findOne({ [constants_1.TableFields.boardId]: boardId, [constants_1.TableFields.userId]: user._id });
            if (isMember)
                throw new ValidationError_1.default(ValidationMsgs.AlreadyMember);
        }
        const existingInvite = await boardInvitation_1.default.findOne({ [constants_1.TableFields.boardId]: boardId, [constants_1.TableFields.email]: normalizedEmail });
        if (existingInvite)
            throw new ValidationError_1.default(ValidationMsgs.AlreadyMember);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + INVITE_EXPIRY_DAYS);
        const token = crypto_1.default.randomBytes(32).toString("hex");
        await boardInvitation_1.default.create({
            [constants_1.TableFields.boardId]: boardId,
            [constants_1.TableFields.email]: normalizedEmail,
            [constants_1.TableFields.token]: token,
            [constants_1.TableFields.invitedBy]: invitedByUserId,
            [constants_1.TableFields.expiresAt]: expiresAt,
        });
        return { token, expiresAt };
    }
    static async listMembersAndInvites(boardId, userId) {
        await this.assertCanAccess(boardId, userId);
        const members = await boardMember_1.default.find({ [constants_1.TableFields.boardId]: boardId })
            .populate(constants_1.TableFields.userId, "name email")
            .lean();
        const invitations = await boardInvitation_1.default.find({ [constants_1.TableFields.boardId]: boardId })
            .populate(constants_1.TableFields.invitedBy, "name email")
            .lean();
        return { members, invitations };
    }
    static async acceptInvite(token, userId) {
        const invite = await boardInvitation_1.default.findOne({ [constants_1.TableFields.token]: token });
        if (!invite || invite.expiresAt < new Date())
            throw new ValidationError_1.default(ValidationMsgs.InviteNotFound);
        const user = await user_1.default.findById(userId);
        if (!user || user.email?.toLowerCase() !== invite.email.toLowerCase())
            throw new ValidationError_1.default("This invitation was sent to a different email.");
        const existing = await boardMember_1.default.findOne({ [constants_1.TableFields.boardId]: invite.boardId, [constants_1.TableFields.userId]: userId });
        if (existing)
            throw new ValidationError_1.default(ValidationMsgs.AlreadyMember);
        await boardMember_1.default.create({
            [constants_1.TableFields.boardId]: invite.boardId,
            [constants_1.TableFields.userId]: userId,
            [constants_1.TableFields.role]: "member",
        });
        await boardInvitation_1.default.deleteOne({ _id: invite._id });
        return { boardId: invite.boardId.toString() };
    }
    static async removeMember(boardId, memberUserId, byUserId) {
        const board = await board_1.default.findById(boardId);
        if (!board)
            throw new ValidationError_1.default(ValidationMsgs.BoardNotFound);
        const isOwner = board.owner.toString() === byUserId.toString();
        const member = await boardMember_1.default.findOne({ [constants_1.TableFields.boardId]: boardId, [constants_1.TableFields.userId]: memberUserId });
        if (!member)
            throw new ValidationError_1.default("Member not found.");
        if (board.owner.toString() === memberUserId)
            throw new ValidationError_1.default("Cannot remove the board owner.");
        if (!isOwner && byUserId.toString() !== memberUserId)
            throw new ValidationError_1.default("Only the owner can remove other members.");
        await boardMember_1.default.deleteOne({ _id: member._id });
    }
    static async cancelInvite(boardId, invitationId, byUserId) {
        await this.assertCanAccess(boardId, byUserId);
        const invite = await boardInvitation_1.default.findOne({ _id: invitationId, [constants_1.TableFields.boardId]: boardId });
        if (!invite)
            throw new ValidationError_1.default("Invitation not found.");
        await boardInvitation_1.default.deleteOne({ _id: invitationId });
    }
}
exports.default = BoardService;
function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
//# sourceMappingURL=BoardService.js.map