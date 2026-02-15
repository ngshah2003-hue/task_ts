import mongoose from "mongoose";
import { TableNames, TableFields } from "../../utils/constants";

export interface IBoardInvitationDoc extends mongoose.Document {
  boardId: mongoose.Types.ObjectId;
  email: string;
  token: string;
  invitedBy: mongoose.Types.ObjectId;
  expiresAt: Date;
  createdAt: Date;
}

const boardInvitationSchema = new mongoose.Schema<IBoardInvitationDoc>(
  {
    [TableFields.boardId]: { type: mongoose.Schema.Types.ObjectId, required: true, ref: TableNames.Board },
    [TableFields.email]: { type: String, required: true, trim: true, lowercase: true },
    [TableFields.token]: { type: String, required: true, unique: true },
    [TableFields.invitedBy]: { type: mongoose.Schema.Types.ObjectId, required: true, ref: TableNames.User },
    [TableFields.expiresAt]: { type: Date, required: true },
  },
  { timestamps: true },
);

boardInvitationSchema.index({ [TableFields.boardId]: 1, [TableFields.email]: 1 }, { unique: true });
boardInvitationSchema.index({ [TableFields.token]: 1 });

const BoardInvitation = mongoose.model<IBoardInvitationDoc>(TableNames.BoardInvitation, boardInvitationSchema);
export default BoardInvitation;
