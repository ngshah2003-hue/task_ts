"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const validator_1 = __importDefault(require("validator"));
const constants_1 = require("../../utils/constants");
const ValidationError_1 = __importDefault(require("../../utils/ValidationError"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userSchema = new mongoose_1.default.Schema({
    [constants_1.TableFields.name_]: { type: String, trim: true },
    [constants_1.TableFields.email]: {
        type: String,
        required: [true, constants_1.ValidationMsgs.EmailEmpty],
        trim: true,
        unique: true,
        lowercase: true,
        validate(value) {
            if (!validator_1.default.isEmail(value))
                throw new ValidationError_1.default(constants_1.ValidationMsgs.EmailInvalid);
        },
    },
    [constants_1.TableFields.password]: {
        type: String,
        minlength: [8, constants_1.ValidationMsgs.PasswordMinLength],
        trim: true,
        required: [true, constants_1.ValidationMsgs.PasswordEmpty],
    },
    [constants_1.TableFields.tokens]: [
        { [constants_1.TableFields.ID]: false, [constants_1.TableFields.token]: { type: String } },
    ],
    [constants_1.TableFields.userType]: {
        type: Number,
        enum: Object.values(constants_1.UserTypes),
        default: constants_1.UserTypes.Customer,
    },
    [constants_1.TableFields.active]: { type: Boolean, default: true },
}, {
    timestamps: true,
    toJSON: {
        transform(_doc, ret) {
            delete ret[constants_1.TableFields.tokens];
            delete ret[constants_1.TableFields.password];
            delete ret.__v;
        },
    },
});
userSchema.methods.isValidAuth = async function (password) {
    return bcryptjs_1.default.compare(password, this.password);
};
userSchema.methods.isValidPassword = function (password) {
    return constants_1.PASSWORD_REGEX.test(password);
};
userSchema.methods.createAuthToken = function (interfaceType) {
    const payload = { [constants_1.TableFields.ID]: this[constants_1.TableFields.ID].toString() };
    if (interfaceType)
        payload[constants_1.TableFields.interface] = interfaceType;
    return jsonwebtoken_1.default.sign(payload, process.env.JWT_USER_PK);
};
userSchema.pre("save", async function (next) {
    if (this.isModified(constants_1.TableFields.password)) {
        this[constants_1.TableFields.password] = await bcryptjs_1.default.hash(this[constants_1.TableFields.password], 8);
    }
    next();
});
userSchema.index({ [constants_1.TableFields.email]: 1 }, { unique: true });
const User = mongoose_1.default.model(constants_1.TableNames.User, userSchema);
exports.default = User;
//# sourceMappingURL=user.js.map