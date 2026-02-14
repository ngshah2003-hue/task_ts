"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../utils/constants");
const ValidationError_1 = __importDefault(require("../../utils/ValidationError"));
const admin_1 = __importDefault(require("../models/admin"));
class ProjectionBuilder {
    constructor(methodToExecute) {
        this.methodToExecute = methodToExecute;
        this.projection = {};
    }
    withBasicInfo() {
        this.projection[constants_1.TableFields.name_] = 1;
        this.projection[constants_1.TableFields.ID] = 1;
        this.projection[constants_1.TableFields.email] = 1;
        this.projection[constants_1.TableFields.userType] = 1;
        this.projection[constants_1.TableFields.active] = 1;
        return this;
    }
    withPassword() {
        this.projection[constants_1.TableFields.password] = 1;
        return this;
    }
    withUserType() {
        this.projection[constants_1.TableFields.userType] = 1;
        return this;
    }
    withApproved() {
        this.projection[constants_1.TableFields.approved] = 1;
        return this;
    }
    async execute() {
        return this.methodToExecute.call(this.projection);
    }
}
class AdminService {
    static findByEmail(email) {
        return new ProjectionBuilder(async function () {
            return admin_1.default.findOne({ [constants_1.TableFields.email]: email }, this);
        });
    }
    static getUserByIdAndToken(adminId, token) {
        return new ProjectionBuilder(async function () {
            return admin_1.default.findOne({
                [constants_1.TableFields.ID]: adminId,
                [`${constants_1.TableFields.tokens}.${constants_1.TableFields.token}`]: token,
            }, this).lean(false);
        });
    }
    static async saveAuthToken(adminId, token) {
        await admin_1.default.updateOne({ [constants_1.TableFields.ID]: adminId }, { $push: { [constants_1.TableFields.tokens]: { [constants_1.TableFields.token]: token } } });
    }
    static async removeAuth(adminId, authToken) {
        await admin_1.default.updateOne({ [constants_1.TableFields.ID]: adminId }, { $pull: { [constants_1.TableFields.tokens]: { [constants_1.TableFields.token]: authToken } } });
    }
    static async insertUserRecord(reqBody) {
        const email = `${reqBody[constants_1.TableFields.email] ?? ""}`.trim().toLowerCase();
        const password = reqBody[constants_1.TableFields.password];
        if (!email)
            throw new ValidationError_1.default(constants_1.ValidationMsgs.EmailEmpty);
        if (!password)
            throw new ValidationError_1.default(constants_1.ValidationMsgs.PasswordEmpty);
        const exists = await admin_1.default.exists({ [constants_1.TableFields.email]: email });
        if (exists)
            throw new ValidationError_1.default(constants_1.ValidationMsgs.DuplicateEmail);
        const admin = new admin_1.default({
            [constants_1.TableFields.email]: email,
            [constants_1.TableFields.password]: password,
            [constants_1.TableFields.name_]: reqBody[constants_1.TableFields.name_] ?? "",
            [constants_1.TableFields.approved]: true,
            [constants_1.TableFields.userType]: constants_1.UserTypes.Admin,
        });
        if (!admin.isValidPassword(password))
            throw new ValidationError_1.default(constants_1.ValidationMsgs.PasswordInvalid);
        await admin.save();
        return admin;
    }
}
exports.default = AdminService;
//# sourceMappingURL=AdminService.js.map