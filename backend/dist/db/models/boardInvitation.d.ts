import mongoose from "mongoose";
export interface IBoardInvitationDoc extends mongoose.Document {
    boardId: mongoose.Types.ObjectId;
    email: string;
    token: string;
    invitedBy: mongoose.Types.ObjectId;
    expiresAt: Date;
    createdAt: Date;
}
declare const BoardInvitation: mongoose.Model<IBoardInvitationDoc, {}, {}, {}, mongoose.Document<unknown, {}, IBoardInvitationDoc> & IBoardInvitationDoc & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default BoardInvitation;
//# sourceMappingURL=boardInvitation.d.ts.map