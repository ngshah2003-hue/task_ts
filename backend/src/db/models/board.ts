import mongoose from "mongoose";
import { TableNames, TableFields } from "../../utils/constants";

export interface IBoardDoc extends mongoose.Document {
  title: string;
  owner: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const boardSchema = new mongoose.Schema<IBoardDoc>(
  {
    [TableFields.title]: { type: String, required: true, trim: true, maxlength: 200 },
    [TableFields.owner]: { type: mongoose.Schema.Types.ObjectId, required: true, ref: TableNames.User },
  },
  { timestamps: true },
);

boardSchema.index({ [TableFields.owner]: 1 });

const Board = mongoose.model<IBoardDoc>(TableNames.Board, boardSchema);
export default Board;
