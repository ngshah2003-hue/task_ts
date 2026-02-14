"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const constants_1 = require("../utils/constants");
const util_1 = __importDefault(require("../utils/util"));
const ValidationError_1 = __importDefault(require("../utils/ValidationError"));
const AdminService_1 = __importDefault(require("../db/services/AdminService"));
const auth = async (req, res, next) => {
    try {
        const authHeader = req.header("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(constants_1.ResponseStatus.Unauthorized).send(util_1.default.getErrorMessageFromString(constants_1.ValidationMsgs.AuthFail));
            return;
        }
        const headerToken = authHeader.replace("Bearer ", "");
        const decoded = jsonwebtoken_1.default.verify(headerToken, process.env.JWT_ADMIN_PK);
        const admin = await AdminService_1.default.getUserByIdAndToken(decoded[constants_1.TableFields.ID], headerToken)
            .withBasicInfo()
            .withApproved()
            .execute();
        if (!admin)
            throw new ValidationError_1.default(constants_1.ValidationMsgs.UserNotFound);
        if (admin[constants_1.TableFields.approved] !== true) {
            res.status(constants_1.ResponseStatus.Unauthorized).send(util_1.default.getErrorMessageFromString(constants_1.ValidationMsgs.AuthFail));
            return;
        }
        req.user = admin;
        req.user[constants_1.TableFields.userType] = constants_1.UserTypes.Admin;
        req.user[constants_1.TableFields.authType] = constants_1.AuthTypes.Admin;
        req[constants_1.TableFields.interface] =
            decoded[constants_1.TableFields.interface] ?? constants_1.InterfaceTypes.Admin.AdminWeb;
        next();
    }
    catch (e) {
        if (!(e instanceof ValidationError_1.default))
            console.error(e);
        res.status(constants_1.ResponseStatus.Unauthorized).send(util_1.default.getErrorMessageFromString(constants_1.ValidationMsgs.AuthFail));
    }
};
exports.default = auth;
//# sourceMappingURL=adminAuth.js.map