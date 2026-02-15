import type mongoose from "mongoose";
import type { IBoardDoc } from "../models/board";
import type { ICardDoc } from "../models/card";
export default class BoardService {
    static canAccessBoard(boardId: string, userId: mongoose.Types.ObjectId): Promise<IBoardDoc | null>;
    static listByOwner(userId: mongoose.Types.ObjectId): Promise<IBoardDoc[]>;
    static getById(boardId: string, userId: mongoose.Types.ObjectId): Promise<IBoardDoc | null>;
    static getBoardWithListsAndCards(boardId: string, userId: mongoose.Types.ObjectId, filters?: {
        q?: string;
        status?: string;
    }, listPagination?: {
        page: number;
        limit: number;
    }): Promise<{
        board: IBoardDoc;
        lists: Array<{
            _id: mongoose.Types.ObjectId;
            title: string;
            boardId: mongoose.Types.ObjectId;
            order: number;
            cards: ICardDoc[];
        }>;
        totalLists: number;
        totalPages: number;
    } | null>;
    static create(userId: mongoose.Types.ObjectId, body: {
        title: string;
    }): Promise<IBoardDoc>;
    static delete(boardId: string, userId: mongoose.Types.ObjectId): Promise<void>;
    static assertCanAccess(boardId: string, userId: mongoose.Types.ObjectId): Promise<IBoardDoc>;
    static invite(boardId: string, email: string, invitedByUserId: mongoose.Types.ObjectId): Promise<{
        token: string;
        expiresAt: Date;
    }>;
    static listMembersAndInvites(boardId: string, userId: mongoose.Types.ObjectId): Promise<{
        members: (mongoose.FlattenMaps<import("../models/boardMember").IBoardMemberDoc> & {
            _id: mongoose.Types.ObjectId;
        })[];
        invitations: (mongoose.FlattenMaps<import("../models/boardInvitation").IBoardInvitationDoc> & {
            _id: mongoose.Types.ObjectId;
        })[];
    }>;
    static acceptInvite(token: string, userId: mongoose.Types.ObjectId): Promise<{
        boardId: string;
    }>;
    static removeMember(boardId: string, memberUserId: string, byUserId: mongoose.Types.ObjectId): Promise<void>;
    static cancelInvite(boardId: string, invitationId: string, byUserId: mongoose.Types.ObjectId): Promise<void>;
}
//# sourceMappingURL=BoardService.d.ts.map