import mongoose from "mongoose";
import { TableNames, TableFields } from "../../utils/constants";

export interface IBoardMemberDoc extends mongoose.Document {
  boardId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  role: string;
  addedAt: Date;
}

const boardMemberSchema = new mongoose.Schema<IBoardMemberDoc>(
  {
    [TableFields.boardId]: { type: mongoose.Schema.Types.ObjectId, required: true, ref: TableNames.Board },
    [TableFields.userId]: { type: mongoose.Schema.Types.ObjectId, required: true, ref: TableNames.User },
    [TableFields.role]: { type: String, default: "member" },
  },
  { timestamps: true },
);

boardMemberSchema.index({ [TableFields.boardId]: 1, [TableFields.userId]: 1 }, { unique: true });

const BoardMember = mongoose.model<IBoardMemberDoc>(TableNames.BoardMember, boardMemberSchema);
export default BoardMember;
