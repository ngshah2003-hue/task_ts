import mongoose from "mongoose";
import { TableNames, TableFields } from "../../utils/constants";

export const ActivityActionTypes = {
  CardCreated: "card_created",
  CardMoved: "card_moved",
  CardUpdated: "card_updated",
  CardDeleted: "card_deleted",
  ListCreated: "list_created",
  ListDeleted: "list_deleted",
} as const;

export interface IActivityDoc extends mongoose.Document {
  boardId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  actionType: string;
  cardId?: mongoose.Types.ObjectId;
  cardTitle?: string;
  listId?: mongoose.Types.ObjectId;
  listTitle?: string;
  fromListTitle?: string;
  toListTitle?: string;
  createdAt: Date;
}

const activitySchema = new mongoose.Schema<IActivityDoc>(
  {
    [TableFields.boardId]: { type: mongoose.Schema.Types.ObjectId, required: true, ref: TableNames.Board },
    [TableFields.userId]: { type: mongoose.Schema.Types.ObjectId, required: true, ref: TableNames.User },
    [TableFields.actionType]: { type: String, required: true },
    [TableFields.cardId]: { type: mongoose.Schema.Types.ObjectId, ref: TableNames.Card },
    [TableFields.cardTitle]: { type: String },
    [TableFields.listId]: { type: mongoose.Schema.Types.ObjectId, ref: TableNames.List },
    [TableFields.listTitle]: { type: String },
    [TableFields.fromListTitle]: { type: String },
    [TableFields.toListTitle]: { type: String },
  },
  { timestamps: true },
);

activitySchema.index({ [TableFields.boardId]: 1, createdAt: -1 });

const Activity = mongoose.model<IActivityDoc>(TableNames.Activity, activitySchema);
export default Activity;
