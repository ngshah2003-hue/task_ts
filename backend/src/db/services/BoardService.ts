import crypto from "crypto";
import { TableFields } from "../../utils/constants";
import ValidationError from "../../utils/ValidationError";
import Board from "../models/board";
import List from "../models/list";
import Card from "../models/card";
import BoardMember from "../models/boardMember";
import BoardInvitation from "../models/boardInvitation";
import User from "../models/user";
import Activity from "../models/activity";
import type mongoose from "mongoose";
import type { IBoardDoc } from "../models/board";
import type { ICardDoc } from "../models/card";

const ValidationMsgs = {
  BoardNotFound: "Board not found.",
  NotBoardOwner: "You do not have access to this board.",
  InviteNotFound: "Invitation not found or expired.",
  AlreadyMember: "User is already a member or has a pending invite.",
};

const INVITE_EXPIRY_DAYS = 7;

export default class BoardService {
  static async canAccessBoard(boardId: string, userId: mongoose.Types.ObjectId): Promise<IBoardDoc | null> {
    const board = await Board.findById(boardId);
    if (!board) return null;
    if (board.owner.toString() === userId.toString()) return board;
    const member = await BoardMember.findOne({ [TableFields.boardId]: boardId, [TableFields.userId]: userId });
    return member ? board : null;
  }

  static async listByOwner(userId: mongoose.Types.ObjectId): Promise<IBoardDoc[]> {
    const memberBoardIds = (await BoardMember.find({ [TableFields.userId]: userId }).distinct(TableFields.boardId)) as mongoose.Types.ObjectId[];
    return Board.find({
      $or: [{ [TableFields.owner]: userId }, { _id: { $in: memberBoardIds } }],
    })
      .sort({ createdAt: -1 })
      .lean();
  }

  static async getById(boardId: string, userId: mongoose.Types.ObjectId): Promise<IBoardDoc | null> {
    return this.canAccessBoard(boardId, userId);
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
    const board = await this.canAccessBoard(boardId, userId);
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
    await BoardMember.deleteMany({ [TableFields.boardId]: boardId });
    await BoardInvitation.deleteMany({ [TableFields.boardId]: boardId });
    await Activity.deleteMany({ [TableFields.boardId]: boardId });
    await Board.deleteOne({ _id: boardId });
  }

  static async assertCanAccess(boardId: string, userId: mongoose.Types.ObjectId): Promise<IBoardDoc> {
    const board = await this.canAccessBoard(boardId, userId);
    if (!board) throw new ValidationError(ValidationMsgs.NotBoardOwner);
    return board;
  }

  static async invite(
    boardId: string,
    email: string,
    invitedByUserId: mongoose.Types.ObjectId,
  ): Promise<{ token: string; expiresAt: Date }> {
    await this.assertCanAccess(boardId, invitedByUserId);
    const board = await Board.findById(boardId);
    if (!board) throw new ValidationError(ValidationMsgs.BoardNotFound);
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) throw new ValidationError("Email is required.");
    const user = await User.findOne({ email: normalizedEmail });
    if (user) {
      const isMember = await BoardMember.findOne({ [TableFields.boardId]: boardId, [TableFields.userId]: user._id });
      if (isMember) throw new ValidationError(ValidationMsgs.AlreadyMember);
    }
    const existingInvite = await BoardInvitation.findOne({ [TableFields.boardId]: boardId, [TableFields.email]: normalizedEmail });
    if (existingInvite) throw new ValidationError(ValidationMsgs.AlreadyMember);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + INVITE_EXPIRY_DAYS);
    const token = crypto.randomBytes(32).toString("hex");
    await BoardInvitation.create({
      [TableFields.boardId]: boardId,
      [TableFields.email]: normalizedEmail,
      [TableFields.token]: token,
      [TableFields.invitedBy]: invitedByUserId,
      [TableFields.expiresAt]: expiresAt,
    });
    return { token, expiresAt };
  }

  static async listMembersAndInvites(boardId: string, userId: mongoose.Types.ObjectId) {
    await this.assertCanAccess(boardId, userId);
    const members = await BoardMember.find({ [TableFields.boardId]: boardId })
      .populate(TableFields.userId, "name email")
      .lean();
    const invitations = await BoardInvitation.find({ [TableFields.boardId]: boardId })
      .populate(TableFields.invitedBy, "name email")
      .lean();
    return { members, invitations };
  }

  static async acceptInvite(token: string, userId: mongoose.Types.ObjectId): Promise<{ boardId: string }> {
    const invite = await BoardInvitation.findOne({ [TableFields.token]: token });
    if (!invite || invite.expiresAt < new Date()) throw new ValidationError(ValidationMsgs.InviteNotFound);
    const user = await User.findById(userId);
    if (!user || user.email?.toLowerCase() !== invite.email.toLowerCase()) throw new ValidationError("This invitation was sent to a different email.");
    const existing = await BoardMember.findOne({ [TableFields.boardId]: invite.boardId, [TableFields.userId]: userId });
    if (existing) throw new ValidationError(ValidationMsgs.AlreadyMember);
    await BoardMember.create({
      [TableFields.boardId]: invite.boardId,
      [TableFields.userId]: userId,
      [TableFields.role]: "member",
    });
    await BoardInvitation.deleteOne({ _id: invite._id });
    return { boardId: invite.boardId.toString() };
  }

  static async removeMember(boardId: string, memberUserId: string, byUserId: mongoose.Types.ObjectId): Promise<void> {
    const board = await Board.findById(boardId);
    if (!board) throw new ValidationError(ValidationMsgs.BoardNotFound);
    const isOwner = board.owner.toString() === byUserId.toString();
    const member = await BoardMember.findOne({ [TableFields.boardId]: boardId, [TableFields.userId]: memberUserId });
    if (!member) throw new ValidationError("Member not found.");
    if (board.owner.toString() === memberUserId) throw new ValidationError("Cannot remove the board owner.");
    if (!isOwner && byUserId.toString() !== memberUserId) throw new ValidationError("Only the owner can remove other members.");
    await BoardMember.deleteOne({ _id: member._id });
  }

  static async cancelInvite(boardId: string, invitationId: string, byUserId: mongoose.Types.ObjectId): Promise<void> {
    await this.assertCanAccess(boardId, byUserId);
    const invite = await BoardInvitation.findOne({ _id: invitationId, [TableFields.boardId]: boardId });
    if (!invite) throw new ValidationError("Invitation not found.");
    await BoardInvitation.deleteOne({ _id: invitationId });
  }
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
