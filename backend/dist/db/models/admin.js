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
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const adminSchema = new mongoose_1.default.Schema({
    [constants_1.TableFields.name_]: { type: String, trim: true },
    [constants_1.TableFields.image]: { type: String, trim: true },
    [constants_1.TableFields.email]: {
        type: String,
        required: [true, constants_1.ValidationMsgs.EmailEmpty],
        trim: true,
        unique: true,
        lowercase: true,
        validate(value) {
            if (!validator_1.default.isEmail(value)) {
                throw new ValidationError_1.default(constants_1.ValidationMsgs.EmailInvalid);
            }
        },
    },
    [constants_1.TableFields.password]: {
        type: String,
        minlength: 8,
        trim: true,
        required: [true, constants_1.ValidationMsgs.PasswordEmpty],
    },
    [constants_1.TableFields.tokens]: [
        {
            [constants_1.TableFields.ID]: false,
            [constants_1.TableFields.token]: { type: String },
        },
    ],
    [constants_1.TableFields.userType]: {
        type: Number,
        enum: Object.values(constants_1.UserTypes),
    },
    [constants_1.TableFields.approved]: { type: Boolean, default: false },
    [constants_1.TableFields.active]: { type: Boolean, default: true },
    [constants_1.TableFields.passwordResetToken]: { type: String, trim: true },
    [constants_1.TableFields.passwordResetExpires]: { type: Date },
}, {
    timestamps: true,
    toJSON: {
        transform(_doc, ret) {
            delete ret[constants_1.TableFields.tokens];
            delete ret[constants_1.TableFields.passwordResetToken];
            delete ret[constants_1.TableFields.passwordResetExpires];
            delete ret[constants_1.TableFields.password];
            delete ret.createdAt;
            delete ret.updatedAt;
            delete ret.__v;
        },
    },
});
adminSchema.methods.isValidAuth = async function (password) {
    return await bcryptjs_1.default.compare(password, this.password);
};
adminSchema.methods.isValidPassword = function (password) {
    const regEx = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regEx.test(password);
};
adminSchema.methods.createAuthToken = function () {
    return jsonwebtoken_1.default.sign({ [constants_1.TableFields.ID]: this[constants_1.TableFields.ID].toString() }, process.env.JWT_ADMIN_PK);
};
adminSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto_1.default.randomBytes(32).toString("hex");
    this[constants_1.TableFields.passwordResetToken] = crypto_1.default
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
    this[constants_1.TableFields.passwordResetExpires] = new Date(Date.now() + 3600000);
    return resetToken;
};
adminSchema.pre("save", async function (next) {
    if (this.isModified(constants_1.TableFields.password)) {
        this[constants_1.TableFields.password] = await bcryptjs_1.default.hash(this[constants_1.TableFields.password], 8);
    }
    next();
});
adminSchema.index({ [constants_1.TableFields.email]: 1 }, { unique: true });
const Admin = mongoose_1.default.model(constants_1.TableNames.Admin, adminSchema);
exports.default = Admin;
//# sourceMappingURL=admin.js.map