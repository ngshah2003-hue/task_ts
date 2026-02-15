"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const validator_1 = __importDefault(require("validator"));
const constants_1 = require("../../utils/constants");
const ValidationError_1 = __importDefault(require("../../utils/ValidationError"));
const user_1 = __importDefault(require("../models/user"));
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
    async execute() {
        return this.methodToExecute.call(this.projection);
    }
}
class UserService {
    static findByEmail(email) {
        return new ProjectionBuilder(async function () {
            return user_1.default.findOne({ [constants_1.TableFields.email]: email }, this);
        });
    }
    static getUserByIdAndToken(userId, token) {
        return new ProjectionBuilder(async function () {
            return user_1.default.findOne({
                [constants_1.TableFields.ID]: userId,
                [`${constants_1.TableFields.tokens}.${constants_1.TableFields.token}`]: token,
            }, this).lean(false);
        });
    }
    static async saveAuthToken(userId, token) {
        await user_1.default.updateOne({ [constants_1.TableFields.ID]: userId }, { $push: { [constants_1.TableFields.tokens]: { [constants_1.TableFields.token]: token } } });
    }
    static async removeAuth(userId, authToken) {
        await user_1.default.updateOne({ [constants_1.TableFields.ID]: userId }, { $pull: { [constants_1.TableFields.tokens]: { [constants_1.TableFields.token]: authToken } } });
    }
    static async insertUserRecord(reqBody) {
        const name = `${reqBody[constants_1.TableFields.name_] ?? ""}`.trim();
        const email = `${reqBody[constants_1.TableFields.email] ?? ""}`.trim().toLowerCase();
        const password = typeof reqBody[constants_1.TableFields.password] === "string" ? reqBody[constants_1.TableFields.password] : "";
        if (!name)
            throw new ValidationError_1.default(constants_1.ValidationMsgs.NameEmpty);
        if (name.length > 100)
            throw new ValidationError_1.default(constants_1.ValidationMsgs.NameTooLong);
        if (!email)
            throw new ValidationError_1.default(constants_1.ValidationMsgs.EmailEmpty);
        if (!validator_1.default.isEmail(email))
            throw new ValidationError_1.default(constants_1.ValidationMsgs.EmailInvalid);
        if (!password)
            throw new ValidationError_1.default(constants_1.ValidationMsgs.PasswordEmpty);
        if (password.length < 8)
            throw new ValidationError_1.default(constants_1.ValidationMsgs.PasswordMinLength);
        if (!constants_1.PASSWORD_REGEX.test(password))
            throw new ValidationError_1.default(constants_1.ValidationMsgs.PasswordInvalid);
        const exists = await user_1.default.exists({ [constants_1.TableFields.email]: email });
        if (exists)
            throw new ValidationError_1.default(constants_1.ValidationMsgs.DuplicateEmail);
        const userType = reqBody[constants_1.TableFields.userType] ?? constants_1.UserTypes.Customer;
        const user = new user_1.default({
            [constants_1.TableFields.email]: email,
            [constants_1.TableFields.password]: password,
            [constants_1.TableFields.name_]: name,
            [constants_1.TableFields.userType]: userType,
        });
        await user.save();
        return user;
    }
}
exports.default = UserService;
//# sourceMappingURL=UserService.js.map