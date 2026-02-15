import mongoose from "mongoose";
import { TableNames, TableFields } from "../../utils/constants";

export interface IListDoc extends mongoose.Document {
  title: string;
  boardId: mongoose.Types.ObjectId;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const listSchema = new mongoose.Schema<IListDoc>(
  {
    [TableFields.title]: { type: String, required: true, trim: true, maxlength: 200 },
    [TableFields.boardId]: { type: mongoose.Schema.Types.ObjectId, required: true, ref: TableNames.Board },
    [TableFields.order]: { type: Number, required: true, default: 0 },
  },
  { timestamps: true },
);

listSchema.index({ [TableFields.boardId]: 1, [TableFields.order]: 1 });

const List = mongoose.model<IListDoc>(TableNames.List, listSchema);
export default List;
