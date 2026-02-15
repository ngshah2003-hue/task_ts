import type mongoose from "mongoose";
import type { ICardDoc } from "../models/card";
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
    static create(boardId: string, listId: string, userId: mongoose.Types.ObjectId, body: {
        title: string;
        dueDate?: string | Date;
        status?: string;
    }): Promise<ICardDoc>;
    static update(cardId: string, userId: mongoose.Types.ObjectId, body: {
        title?: string;
        dueDate?: string | Date | null;
        status?: string;
    }): Promise<ICardDoc>;
    static delete(cardId: string, userId: mongoose.Types.ObjectId): Promise<void>;
    static reindexList(listId: string): Promise<void>;
    static move(cardId: string, userId: mongoose.Types.ObjectId, targetListId: string, position: number): Promise<ICardDoc>;
    static listByBoard(boardId: string, userId: mongoose.Types.ObjectId, opts?: CardListOptions): Promise<CardListResult>;
}
//# sourceMappingURL=CardService.d.ts.map