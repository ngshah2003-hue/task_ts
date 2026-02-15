import mongoose from "mongoose";
import { TableNames, TableFields, CardStatus } from "../../utils/constants";

export interface ICardDoc extends mongoose.Document {
  title: string;
  listId: mongoose.Types.ObjectId;
  boardId: mongoose.Types.ObjectId;
  order: number;
  dueDate?: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const cardSchema = new mongoose.Schema<ICardDoc>(
  {
    [TableFields.title]: { type: String, required: true, trim: true, maxlength: 200 },
    [TableFields.listId]: { type: mongoose.Schema.Types.ObjectId, required: true, ref: TableNames.List },
    [TableFields.boardId]: { type: mongoose.Schema.Types.ObjectId, required: true, ref: TableNames.Board },
    [TableFields.order]: { type: Number, required: true, default: 0 },
    [TableFields.dueDate]: { type: Date, default: null },
    [TableFields.status]: {
      type: String,
      enum: Object.values(CardStatus),
      default: CardStatus.Todo,
    },
  },
  { timestamps: true },
);

cardSchema.index({ [TableFields.listId]: 1, [TableFields.order]: 1 });
cardSchema.index({ [TableFields.boardId]: 1 });
cardSchema.index({ [TableFields.boardId]: 1, [TableFields.status]: 1 });
cardSchema.index({ [TableFields.boardId]: 1, [TableFields.title]: "text" });

cardSchema.path(TableFields.dueDate).validate(function (v: Date | null) {
  if (v == null) return true;
  return !isNaN(v.getTime());
}, "Invalid due date");

const Card = mongoose.model<ICardDoc>(TableNames.Card, cardSchema);
export default Card;
