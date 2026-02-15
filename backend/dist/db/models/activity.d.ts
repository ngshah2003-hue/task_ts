import mongoose from "mongoose";
export declare const ActivityActionTypes: {
    readonly CardCreated: "card_created";
    readonly CardMoved: "card_moved";
    readonly CardUpdated: "card_updated";
    readonly CardDeleted: "card_deleted";
    readonly ListCreated: "list_created";
    readonly ListDeleted: "list_deleted";
};
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
declare const Activity: mongoose.Model<IActivityDoc, {}, {}, {}, mongoose.Document<unknown, {}, IActivityDoc> & IActivityDoc & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default Activity;
//# sourceMappingURL=activity.d.ts.map