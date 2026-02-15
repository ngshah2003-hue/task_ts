import mongoose from "mongoose";
export interface IBoardMemberDoc extends mongoose.Document {
    boardId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    role: string;
    addedAt: Date;
}
declare const BoardMember: mongoose.Model<IBoardMemberDoc, {}, {}, {}, mongoose.Document<unknown, {}, IBoardMemberDoc> & IBoardMemberDoc & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default BoardMember;
//# sourceMappingURL=boardMember.d.ts.map