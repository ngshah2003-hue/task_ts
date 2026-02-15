"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const constants_1 = require("../../utils/constants");
const listSchema = new mongoose_1.default.Schema({
    [constants_1.TableFields.title]: { type: String, required: true, trim: true, maxlength: 200 },
    [constants_1.TableFields.boardId]: { type: mongoose_1.default.Schema.Types.ObjectId, required: true, ref: constants_1.TableNames.Board },
    [constants_1.TableFields.order]: { type: Number, required: true, default: 0 },
}, { timestamps: true });
listSchema.index({ [constants_1.TableFields.boardId]: 1, [constants_1.TableFields.order]: 1 });
const List = mongoose_1.default.model(constants_1.TableNames.List, listSchema);
exports.default = List;
//# sourceMappingURL=list.js.map