import mongoose from "mongoose";
export interface IBoardDoc extends mongoose.Document {
    title: string;
    owner: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
declare const Board: mongoose.Model<IBoardDoc, {}, {}, {}, mongoose.Document<unknown, {}, IBoardDoc> & IBoardDoc & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default Board;
//# sourceMappingURL=board.d.ts.map