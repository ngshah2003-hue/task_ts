import mongoose from "mongoose";
import type { IAdminDoc } from "../../types";
declare const Admin: mongoose.Model<IAdminDoc, {}, {}, {}, mongoose.Document<unknown, {}, IAdminDoc> & IAdminDoc & Required<{
    _id: mongoose.Types.ObjectId;
}>, any>;
export default Admin;
//# sourceMappingURL=admin.d.ts.map