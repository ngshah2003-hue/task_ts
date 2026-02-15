import mongoose from "mongoose";
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
declare const Card: mongoose.Model<ICardDoc, {}, {}, {}, mongoose.Document<unknown, {}, ICardDoc> & ICardDoc & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default Card;
//# sourceMappingURL=card.d.ts.map