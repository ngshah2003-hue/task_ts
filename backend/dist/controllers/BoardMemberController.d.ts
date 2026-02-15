import { Request } from "express";
export declare function invite(req: Request): Promise<{
    message: string;
    token: string;
    expiresAt: Date;
}>;
export declare function listMembers(req: Request): Promise<{
    members: (import("mongoose").FlattenMaps<import("../db/models/boardMember").IBoardMemberDoc> & {
        _id: import("mongoose").Types.ObjectId;
    })[];
    invitations: (import("mongoose").FlattenMaps<import("../db/models/boardInvitation").IBoardInvitationDoc> & {
        _id: import("mongoose").Types.ObjectId;
    })[];
}>;
export declare function acceptInvite(req: Request): Promise<{
    boardId: string;
}>;
export declare function removeMember(req: Request): Promise<{
    success: boolean;
}>;
export declare function cancelInvite(req: Request): Promise<{
    success: boolean;
}>;
//# sourceMappingURL=BoardMemberController.d.ts.map