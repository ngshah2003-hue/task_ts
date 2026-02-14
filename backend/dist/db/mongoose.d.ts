import mongoose from "mongoose";
export declare class MongoUtil {
    static newObjectId(): mongoose.Types.ObjectId;
    static toObjectId(stringId: string): mongoose.Types.ObjectId;
    static isValidObjectID(id: string): boolean;
}
export declare function initConnection(callback: () => void): void;
export { mongoose };
//# sourceMappingURL=mongoose.d.ts.map