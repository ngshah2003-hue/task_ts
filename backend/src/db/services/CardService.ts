import { TableFields, CardStatus } from "../../utils/constants";
import ValidationError from "../../utils/ValidationError";
import BoardService from "./BoardService";
import List from "../models/list";
import Card from "../models/card";
import ActivityService, { ActivityActionTypes } from "./ActivityService";
import type mongoose from "mongoose";
import type { ICardDoc } from "../models/card";

const ValidationMsgs = {
  CardNotFound: "Card not found.",
  NotBoardOwner: "You do not have access to this board.",
  ListNotFound: "List not found.",
};

export interface CardListOptions {
  page?: number;
  limit?: number;
  status?: string;
  q?: string;
}

export interface CardListResult {
  cards: ICardDoc[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default class CardService {
  static async create(
    boardId: string,
    listId: string,
    userId: mongoose.Types.ObjectId,
    body: { title: string; dueDate?: string | Date; status?: string },
  ): Promise<ICardDoc> {
    await BoardService.assertCanAccess(boardId, userId);
    const list = await List.findOne({ _id: listId, [TableFields.boardId]: boardId });
    if (!list) throw new ValidationError(ValidationMsgs.ListNotFound);
    const title = (body.title ?? "").toString().trim();
    if (!title) throw new ValidationError("Card title is required.");
    const maxOrder = await Card.findOne({ [TableFields.listId]: listId })
      .sort({ [TableFields.order]: -1 })
      .select(TableFields.order)
      .lean();
    const order = (maxOrder?.order ?? -1) + 1;
    let dueDate: Date | undefined;
    if (body.dueDate != null) {
      const d = new Date(body.dueDate as string);
      if (isNaN(d.getTime())) throw new ValidationError("Invalid due date.");
      dueDate = d;
    }
    const status = body.status && Object.values(CardStatus).includes(body.status as typeof CardStatus[keyof typeof CardStatus])
      ? body.status
      : CardStatus.Todo;
    const card = new Card({
      [TableFields.title]: title,
      [TableFields.listId]: listId,
      [TableFields.boardId]: boardId,
      [TableFields.order]: order,
      [TableFields.dueDate]: dueDate ?? null,
      [TableFields.status]: status,
    });
    await card.save();
    await ActivityService.log({
      boardId,
      userId,
      actionType: ActivityActionTypes.CardCreated,
      cardId: card._id,
      cardTitle: card.title,
      listId: list._id,
      listTitle: list.title,
    });
    return card;
  }

  static async update(
    cardId: string,
    userId: mongoose.Types.ObjectId,
    body: { title?: string; dueDate?: string | Date | null; status?: string },
  ): Promise<ICardDoc> {
    const card = await Card.findById(cardId);
    if (!card) throw new ValidationError(ValidationMsgs.CardNotFound);
    await BoardService.assertCanAccess(card.boardId.toString(), userId);
    if (body.title !== undefined) {
      const t = body.title.toString().trim();
      if (!t) throw new ValidationError("Card title is required.");
      card.title = t;
    }
    if (body.dueDate !== undefined) {
      if (body.dueDate == null || body.dueDate === "") card.dueDate = undefined;
      else {
        const d = new Date(body.dueDate as string);
        if (isNaN(d.getTime())) throw new ValidationError("Invalid due date.");
        card.dueDate = d;
      }
    }
    if (body.status !== undefined) {
      if (Object.values(CardStatus).includes(body.status as typeof CardStatus[keyof typeof CardStatus])) {
        card.status = body.status;
      }
    }
    await card.save();
    await ActivityService.log({
      boardId: card.boardId,
      userId,
      actionType: ActivityActionTypes.CardUpdated,
      cardId: card._id,
      cardTitle: card.title,
    });
    return card;
  }

  static async delete(cardId: string, userId: mongoose.Types.ObjectId): Promise<void> {
    const card = await Card.findById(cardId);
    if (!card) throw new ValidationError(ValidationMsgs.CardNotFound);
    await BoardService.assertCanAccess(card.boardId.toString(), userId);
    const list = await List.findById(card.listId).lean();
    await ActivityService.log({
      boardId: card.boardId,
      userId,
      actionType: ActivityActionTypes.CardDeleted,
      cardTitle: card.title,
      listTitle: list?.title,
    });
    await Card.deleteOne({ _id: cardId });
    await this.reindexList(card.listId.toString());
  }

  static async reindexList(listId: string): Promise<void> {
    const cards = await Card.find({ [TableFields.listId]: listId }).sort({ [TableFields.order]: 1 });
    for (let i = 0; i < cards.length; i++) {
      if (cards[i].order !== i) {
        await Card.updateOne({ _id: cards[i]._id }, { [TableFields.order]: i });
      }
    }
  }

  static async move(
    cardId: string,
    userId: mongoose.Types.ObjectId,
    targetListId: string,
    position: number,
  ): Promise<ICardDoc> {
    const card = await Card.findById(cardId);
    if (!card) throw new ValidationError(ValidationMsgs.CardNotFound);
    await BoardService.assertCanAccess(card.boardId.toString(), userId);
    const targetList = await List.findOne({ _id: targetListId, [TableFields.boardId]: card.boardId });
    if (!targetList) throw new ValidationError(ValidationMsgs.ListNotFound);
    const sameList = card.listId.toString() === targetListId;
    const fromListId = card.listId.toString();

    if (sameList) {
      const cards = await Card.find({ [TableFields.listId]: fromListId }).sort({ [TableFields.order]: 1 });
      const idx = cards.findIndex((c) => c._id.toString() === cardId);
      if (idx === -1) throw new ValidationError(ValidationMsgs.CardNotFound);
      const newOrder = Math.max(0, Math.min(position, cards.length - 1));
      if (newOrder === idx) return card;
      const reordered = cards.filter((_, i) => i !== idx);
      reordered.splice(newOrder, 0, card);
      for (let i = 0; i < reordered.length; i++) {
        if (reordered[i].order !== i) {
          await Card.updateOne({ _id: reordered[i]._id }, { [TableFields.order]: i });
        }
      }
      await ActivityService.log({
        boardId: card.boardId,
        userId,
        actionType: ActivityActionTypes.CardMoved,
        cardId: card._id,
        cardTitle: card.title,
        fromListTitle: (await List.findById(fromListId).lean())?.title,
        toListTitle: targetList.title,
      });
      card.order = newOrder;
      return card;
    }

    const oldListCards = await Card.find({ [TableFields.listId]: fromListId }).sort({ [TableFields.order]: 1 });
    const newListCards = await Card.find({ [TableFields.listId]: targetListId }).sort({ [TableFields.order]: 1 });
    const pos = Math.max(0, Math.min(position, newListCards.length));

    await Card.updateOne(
      { _id: cardId },
      { [TableFields.listId]: targetListId, [TableFields.order]: pos },
    );

    for (let i = 0; i < oldListCards.length; i++) {
      if (oldListCards[i]._id.toString() !== cardId) {
        const o = oldListCards[i].order;
        if (o !== i) await Card.updateOne({ _id: oldListCards[i]._id }, { [TableFields.order]: i });
      }
    }
    for (let i = 0; i < newListCards.length; i++) {
      const c = newListCards[i];
      if (c._id.toString() === cardId) continue;
      const newOrder = i >= pos ? i + 1 : i;
      if (c.order !== newOrder) await Card.updateOne({ _id: c._id }, { [TableFields.order]: newOrder });
    }
    const inserted = await Card.findById(cardId);
    if (inserted) inserted.order = pos;
    const fromList = await List.findById(fromListId).lean();
    await ActivityService.log({
      boardId: card.boardId,
      userId,
      actionType: ActivityActionTypes.CardMoved,
      cardId: card._id,
      cardTitle: card.title,
      fromListTitle: fromList?.title,
      toListTitle: targetList.title,
    });
    return inserted!;
  }

  static async listByBoard(
    boardId: string,
    userId: mongoose.Types.ObjectId,
    opts: CardListOptions = {},
  ): Promise<CardListResult> {
    await BoardService.assertCanAccess(boardId, userId);
    const page = Math.max(1, opts.page ?? 1);
    const limitCap = opts.limit === undefined || opts.limit === 0 ? 500 : opts.limit;
    const limit = Math.min(500, Math.max(1, limitCap));
    const skip = (page - 1) * limit;
    const filter: Record<string, unknown> = { [TableFields.boardId]: boardId };
    if (opts.status && Object.values(CardStatus).includes(opts.status as typeof CardStatus[keyof typeof CardStatus])) {
      filter[TableFields.status] = opts.status;
    }
    if (opts.q && opts.q.trim()) {
      filter[TableFields.title] = new RegExp(escapeRegex(opts.q.trim()), "i");
    }
    const [cards, total] = await Promise.all([
      Card.find(filter).sort({ [TableFields.order]: 1, createdAt: -1 }).skip(skip).limit(limit).lean(),
      Card.countDocuments(filter),
    ]);
    return {
      cards: cards as ICardDoc[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
