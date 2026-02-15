"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const constants_1 = require("../../utils/constants");
const boardMemberSchema = new mongoose_1.default.Schema({
    [constants_1.TableFields.boardId]: { type: mongoose_1.default.Schema.Types.ObjectId, required: true, ref: constants_1.TableNames.Board },
    [constants_1.TableFields.userId]: { type: mongoose_1.default.Schema.Types.ObjectId, required: true, ref: constants_1.TableNames.User },
    [constants_1.TableFields.role]: { type: String, default: "member" },
}, { timestamps: true });
boardMemberSchema.index({ [constants_1.TableFields.boardId]: 1, [constants_1.TableFields.userId]: 1 }, { unique: true });
const BoardMember = mongoose_1.default.model(constants_1.TableNames.BoardMember, boardMemberSchema);
exports.default = BoardMember;
//# sourceMappingURL=boardMember.js.map