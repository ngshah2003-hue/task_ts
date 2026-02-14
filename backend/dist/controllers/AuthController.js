"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signup = signup;
exports.login = login;
exports.logout = logout;
exports.me = me;
const AdminService_1 = __importDefault(require("../db/services/AdminService"));
const constants_1 = require("../utils/constants");
const ValidationError_1 = __importDefault(require("../utils/ValidationError"));
async function signup(req) {
    const user = await AdminService_1.default.insertUserRecord(req.body);
    const token = user.createAuthToken();
    await AdminService_1.default.saveAuthToken(user[constants_1.TableFields.ID], token);
    return { user, token };
}
async function login(req) {
    let email = req.body[constants_1.TableFields.email];
    if (!email)
        throw new ValidationError_1.default(constants_1.ValidationMsgs.EmailEmpty);
    email = `${email}`.trim().toLowerCase();
    const password = req.body[constants_1.TableFields.password];
    if (!password)
        throw new ValidationError_1.default(constants_1.ValidationMsgs.PasswordEmpty);
    const user = await AdminService_1.default.findByEmail(email)
        .withPassword()
        .withBasicInfo()
        .withUserType()
        .withApproved()
        .execute();
    if (!user || !(await user.isValidAuth(password)) || !user[constants_1.TableFields.active]) {
        throw new ValidationError_1.default(constants_1.ValidationMsgs.UnableToLogin);
    }
    const token = user.createAuthToken();
    await AdminService_1.default.saveAuthToken(user[constants_1.TableFields.ID], token);
    return { user, token };
}
async function logout(req) {
    const headerToken = req.header("Authorization").replace("Bearer ", "");
    await AdminService_1.default.removeAuth(req.user[constants_1.TableFields.ID], headerToken);
    return { message: "Logged out" };
}
async function me(req) {
    return { user: req.user };
}
//# sourceMappingURL=AuthController.js.map