"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../utils/constants");
const ValidationError_1 = __importDefault(require("../../utils/ValidationError"));
const BoardService_1 = __importDefault(require("./BoardService"));
const list_1 = __importDefault(require("../models/list"));
const card_1 = __importDefault(require("../models/card"));
const ActivityService_1 = __importStar(require("./ActivityService"));
const ValidationMsgs = {
    CardNotFound: "Card not found.",
    NotBoardOwner: "You do not have access to this board.",
    ListNotFound: "List not found.",
};
class CardService {
    static async create(boardId, listId, userId, body) {
        await BoardService_1.default.assertCanAccess(boardId, userId);
        const list = await list_1.default.findOne({ _id: listId, [constants_1.TableFields.boardId]: boardId });
        if (!list)
            throw new ValidationError_1.default(ValidationMsgs.ListNotFound);
        const title = (body.title ?? "").toString().trim();
        if (!title)
            throw new ValidationError_1.default("Card title is required.");
        const maxOrder = await card_1.default.findOne({ [constants_1.TableFields.listId]: listId })
            .sort({ [constants_1.TableFields.order]: -1 })
            .select(constants_1.TableFields.order)
            .lean();
        const order = (maxOrder?.order ?? -1) + 1;
        let dueDate;
        if (body.dueDate != null) {
            const d = new Date(body.dueDate);
            if (isNaN(d.getTime()))
                throw new ValidationError_1.default("Invalid due date.");
            dueDate = d;
        }
        const status = body.status && Object.values(constants_1.CardStatus).includes(body.status)
            ? body.status
            : constants_1.CardStatus.Todo;
        const card = new card_1.default({
            [constants_1.TableFields.title]: title,
            [constants_1.TableFields.listId]: listId,
            [constants_1.TableFields.boardId]: boardId,
            [constants_1.TableFields.order]: order,
            [constants_1.TableFields.dueDate]: dueDate ?? null,
            [constants_1.TableFields.status]: status,
        });
        await card.save();
        await ActivityService_1.default.log({
            boardId,
            userId,
            actionType: ActivityService_1.ActivityActionTypes.CardCreated,
            cardId: card._id,
            cardTitle: card.title,
            listId: list._id,
            listTitle: list.title,
        });
        return card;
    }
    static async update(cardId, userId, body) {
        const card = await card_1.default.findById(cardId);
        if (!card)
            throw new ValidationError_1.default(ValidationMsgs.CardNotFound);
        await BoardService_1.default.assertCanAccess(card.boardId.toString(), userId);
        if (body.title !== undefined) {
            const t = body.title.toString().trim();
            if (!t)
                throw new ValidationError_1.default("Card title is required.");
            card.title = t;
        }
        if (body.dueDate !== undefined) {
            if (body.dueDate == null || body.dueDate === "")
                card.dueDate = undefined;
            else {
                const d = new Date(body.dueDate);
                if (isNaN(d.getTime()))
                    throw new ValidationError_1.default("Invalid due date.");
                card.dueDate = d;
            }
        }
        if (body.status !== undefined) {
            if (Object.values(constants_1.CardStatus).includes(body.status)) {
                card.status = body.status;
            }
        }
        await card.save();
        await ActivityService_1.default.log({
            boardId: card.boardId,
            userId,
            actionType: ActivityService_1.ActivityActionTypes.CardUpdated,
            cardId: card._id,
            cardTitle: card.title,
        });
        return card;
    }
    static async delete(cardId, userId) {
        const card = await card_1.default.findById(cardId);
        if (!card)
            throw new ValidationError_1.default(ValidationMsgs.CardNotFound);
        await BoardService_1.default.assertCanAccess(card.boardId.toString(), userId);
        const list = await list_1.default.findById(card.listId).lean();
        await ActivityService_1.default.log({
            boardId: card.boardId,
            userId,
            actionType: ActivityService_1.ActivityActionTypes.CardDeleted,
            cardTitle: card.title,
            listTitle: list?.title,
        });
        await card_1.default.deleteOne({ _id: cardId });
        await this.reindexList(card.listId.toString());
    }
    static async reindexList(listId) {
        const cards = await card_1.default.find({ [constants_1.TableFields.listId]: listId }).sort({ [constants_1.TableFields.order]: 1 });
        for (let i = 0; i < cards.length; i++) {
            if (cards[i].order !== i) {
                await card_1.default.updateOne({ _id: cards[i]._id }, { [constants_1.TableFields.order]: i });
            }
        }
    }
    static async move(cardId, userId, targetListId, position) {
        const card = await card_1.default.findById(cardId);
        if (!card)
            throw new ValidationError_1.default(ValidationMsgs.CardNotFound);
        await BoardService_1.default.assertCanAccess(card.boardId.toString(), userId);
        const targetList = await list_1.default.findOne({ _id: targetListId, [constants_1.TableFields.boardId]: card.boardId });
        if (!targetList)
            throw new ValidationError_1.default(ValidationMsgs.ListNotFound);
        const sameList = card.listId.toString() === targetListId;
        const fromListId = card.listId.toString();
        if (sameList) {
            const cards = await card_1.default.find({ [constants_1.TableFields.listId]: fromListId }).sort({ [constants_1.TableFields.order]: 1 });
            const idx = cards.findIndex((c) => c._id.toString() === cardId);
            if (idx === -1)
                throw new ValidationError_1.default(ValidationMsgs.CardNotFound);
            const newOrder = Math.max(0, Math.min(position, cards.length - 1));
            if (newOrder === idx)
                return card;
            const reordered = cards.filter((_, i) => i !== idx);
            reordered.splice(newOrder, 0, card);
            for (let i = 0; i < reordered.length; i++) {
                if (reordered[i].order !== i) {
                    await card_1.default.updateOne({ _id: reordered[i]._id }, { [constants_1.TableFields.order]: i });
                }
            }
            await ActivityService_1.default.log({
                boardId: card.boardId,
                userId,
                actionType: ActivityService_1.ActivityActionTypes.CardMoved,
                cardId: card._id,
                cardTitle: card.title,
                fromListTitle: (await list_1.default.findById(fromListId).lean())?.title,
                toListTitle: targetList.title,
            });
            card.order = newOrder;
            return card;
        }
        const oldListCards = await card_1.default.find({ [constants_1.TableFields.listId]: fromListId }).sort({ [constants_1.TableFields.order]: 1 });
        const newListCards = await card_1.default.find({ [constants_1.TableFields.listId]: targetListId }).sort({ [constants_1.TableFields.order]: 1 });
        const pos = Math.max(0, Math.min(position, newListCards.length));
        await card_1.default.updateOne({ _id: cardId }, { [constants_1.TableFields.listId]: targetListId, [constants_1.TableFields.order]: pos });
        for (let i = 0; i < oldListCards.length; i++) {
            if (oldListCards[i]._id.toString() !== cardId) {
                const o = oldListCards[i].order;
                if (o !== i)
                    await card_1.default.updateOne({ _id: oldListCards[i]._id }, { [constants_1.TableFields.order]: i });
            }
        }
        for (let i = 0; i < newListCards.length; i++) {
            const c = newListCards[i];
            if (c._id.toString() === cardId)
                continue;
            const newOrder = i >= pos ? i + 1 : i;
            if (c.order !== newOrder)
                await card_1.default.updateOne({ _id: c._id }, { [constants_1.TableFields.order]: newOrder });
        }
        const inserted = await card_1.default.findById(cardId);
        if (inserted)
            inserted.order = pos;
        const fromList = await list_1.default.findById(fromListId).lean();
        await ActivityService_1.default.log({
            boardId: card.boardId,
            userId,
            actionType: ActivityService_1.ActivityActionTypes.CardMoved,
            cardId: card._id,
            cardTitle: card.title,
            fromListTitle: fromList?.title,
            toListTitle: targetList.title,
        });
        return inserted;
    }
    static async listByBoard(boardId, userId, opts = {}) {
        await BoardService_1.default.assertCanAccess(boardId, userId);
        const page = Math.max(1, opts.page ?? 1);
        const limitCap = opts.limit === undefined || opts.limit === 0 ? 500 : opts.limit;
        const limit = Math.min(500, Math.max(1, limitCap));
        const skip = (page - 1) * limit;
        const filter = { [constants_1.TableFields.boardId]: boardId };
        if (opts.status && Object.values(constants_1.CardStatus).includes(opts.status)) {
            filter[constants_1.TableFields.status] = opts.status;
        }
        if (opts.q && opts.q.trim()) {
            filter[constants_1.TableFields.title] = new RegExp(escapeRegex(opts.q.trim()), "i");
        }
        const [cards, total] = await Promise.all([
            card_1.default.find(filter).sort({ [constants_1.TableFields.order]: 1, createdAt: -1 }).skip(skip).limit(limit).lean(),
            card_1.default.countDocuments(filter),
        ]);
        return {
            cards: cards,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 1,
        };
    }
}
exports.default = CardService;
function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
//# sourceMappingURL=CardService.js.map