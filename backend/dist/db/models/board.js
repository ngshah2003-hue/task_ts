"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const constants_1 = require("../../utils/constants");
const boardSchema = new mongoose_1.default.Schema({
    [constants_1.TableFields.title]: { type: String, required: true, trim: true, maxlength: 200 },
    [constants_1.TableFields.owner]: { type: mongoose_1.default.Schema.Types.ObjectId, required: true, ref: constants_1.TableNames.User },
}, { timestamps: true });
boardSchema.index({ [constants_1.TableFields.owner]: 1 });
const Board = mongoose_1.default.model(constants_1.TableNames.Board, boardSchema);
exports.default = Board;
//# sourceMappingURL=board.js.map