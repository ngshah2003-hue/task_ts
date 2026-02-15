import { TableFields } from "../../utils/constants";
import ValidationError from "../../utils/ValidationError";
import Board from "../models/board";
import List from "../models/list";
import Card from "../models/card";
import type mongoose from "mongoose";
import type { IListDoc } from "../models/list";

const ValidationMsgs = {
  ListNotFound: "List not found.",
  NotBoardOwner: "You do not have access to this board.",
};

export default class ListService {
  static async create(
    boardId: string,
    userId: mongoose.Types.ObjectId,
    body: { title: string },
  ): Promise<IListDoc> {
    const board = await Board.findOne({ _id: boardId, [TableFields.owner]: userId });
    if (!board) throw new ValidationError(ValidationMsgs.NotBoardOwner);
    const title = (body.title ?? "").toString().trim();
    if (!title) throw new ValidationError("List title is required.");
    const maxOrder = await List.findOne({ [TableFields.boardId]: boardId })
      .sort({ [TableFields.order]: -1 })
      .select(TableFields.order)
      .lean();
    const order = (maxOrder?.order ?? -1) + 1;
    const list = new List({
      [TableFields.title]: title,
      [TableFields.boardId]: boardId,
      [TableFields.order]: order,
    });
    await list.save();
    return list;
  }

  static async update(
    boardId: string,
    listId: string,
    userId: mongoose.Types.ObjectId,
    body: { title?: string; order?: number },
  ): Promise<IListDoc> {
    const board = await Board.findOne({ _id: boardId, [TableFields.owner]: userId });
    if (!board) throw new ValidationError(ValidationMsgs.NotBoardOwner);
    const list = await List.findOne({ _id: listId, [TableFields.boardId]: boardId });
    if (!list) throw new ValidationError(ValidationMsgs.ListNotFound);
    if (body.title !== undefined) list.title = body.title.trim();
    if (body.order !== undefined) list.order = body.order;
    await list.save();
    return list;
  }

  static async delete(
    boardId: string,
    listId: string,
    userId: mongoose.Types.ObjectId,
  ): Promise<void> {
    const board = await Board.findOne({ _id: boardId, [TableFields.owner]: userId });
    if (!board) throw new ValidationError(ValidationMsgs.NotBoardOwner);
    const list = await List.findOne({ _id: listId, [TableFields.boardId]: boardId });
    if (!list) throw new ValidationError(ValidationMsgs.ListNotFound);
    await Card.deleteMany({ [TableFields.listId]: listId });
    await List.deleteOne({ _id: listId });
  }
}
