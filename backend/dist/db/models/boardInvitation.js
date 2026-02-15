"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const constants_1 = require("../../utils/constants");
const boardInvitationSchema = new mongoose_1.default.Schema({
    [constants_1.TableFields.boardId]: { type: mongoose_1.default.Schema.Types.ObjectId, required: true, ref: constants_1.TableNames.Board },
    [constants_1.TableFields.email]: { type: String, required: true, trim: true, lowercase: true },
    [constants_1.TableFields.token]: { type: String, required: true, unique: true },
    [constants_1.TableFields.invitedBy]: { type: mongoose_1.default.Schema.Types.ObjectId, required: true, ref: constants_1.TableNames.User },
    [constants_1.TableFields.expiresAt]: { type: Date, required: true },
}, { timestamps: true });
boardInvitationSchema.index({ [constants_1.TableFields.boardId]: 1, [constants_1.TableFields.email]: 1 }, { unique: true });
boardInvitationSchema.index({ [constants_1.TableFields.token]: 1 });
const BoardInvitation = mongoose_1.default.model(constants_1.TableNames.BoardInvitation, boardInvitationSchema);
exports.default = BoardInvitation;
//# sourceMappingURL=boardInvitation.js.map