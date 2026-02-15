"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const constants_1 = require("../utils/constants");
const util_1 = __importDefault(require("../utils/util"));
const ValidationError_1 = __importDefault(require("../utils/ValidationError"));
const UserService_1 = __importDefault(require("../db/services/UserService"));
const auth = async (req, res, next) => {
    try {
        const authHeader = req.header("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(constants_1.ResponseStatus.Unauthorized).send(util_1.default.getErrorMessageFromString(constants_1.ValidationMsgs.AuthFail));
            return;
        }
        const headerToken = authHeader.replace("Bearer ", "");
        const decoded = jsonwebtoken_1.default.verify(headerToken, process.env.JWT_USER_PK);
        const user = await UserService_1.default.getUserByIdAndToken(decoded[constants_1.TableFields.ID], headerToken)
            .withBasicInfo()
            .withUserType()
            .execute();
        if (!user)
            throw new ValidationError_1.default(constants_1.ValidationMsgs.UserNotFound);
        if (!user[constants_1.TableFields.active]) {
            res.status(constants_1.ResponseStatus.Unauthorized).send(util_1.default.getErrorMessageFromString(constants_1.ValidationMsgs.AuthFail));
            return;
        }
        req.user = user;
        req.user[constants_1.TableFields.authType] = constants_1.AuthTypes.Customer;
        req[constants_1.TableFields.interface] =
            decoded[constants_1.TableFields.interface] ?? constants_1.InterfaceTypes.Customer.CustomerApp;
        next();
    }
    catch (e) {
        if (!(e instanceof ValidationError_1.default))
            console.error(e);
        res.status(constants_1.ResponseStatus.Unauthorized).send(util_1.default.getErrorMessageFromString(constants_1.ValidationMsgs.AuthFail));
    }
};
exports.default = auth;
//# sourceMappingURL=userAuth.js.map