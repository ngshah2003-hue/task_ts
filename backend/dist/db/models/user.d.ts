import mongoose from "mongoose";
import type { IUserDoc } from "../../types";
declare const User: mongoose.Model<IUserDoc, {}, {}, {}, mongoose.Document<unknown, {}, IUserDoc> & IUserDoc & Required<{
    _id: mongoose.Types.ObjectId;
}>, any>;
export default User;
//# sourceMappingURL=user.d.ts.map