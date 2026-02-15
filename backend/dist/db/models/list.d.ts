import mongoose from "mongoose";
export interface IListDoc extends mongoose.Document {
    title: string;
    boardId: mongoose.Types.ObjectId;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}
declare const List: mongoose.Model<IListDoc, {}, {}, {}, mongoose.Document<unknown, {}, IListDoc> & IListDoc & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default List;
//# sourceMappingURL=list.d.ts.map