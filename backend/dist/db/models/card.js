"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const constants_1 = require("../../utils/constants");
const cardSchema = new mongoose_1.default.Schema({
    [constants_1.TableFields.title]: { type: String, required: true, trim: true, maxlength: 200 },
    [constants_1.TableFields.listId]: { type: mongoose_1.default.Schema.Types.ObjectId, required: true, ref: constants_1.TableNames.List },
    [constants_1.TableFields.boardId]: { type: mongoose_1.default.Schema.Types.ObjectId, required: true, ref: constants_1.TableNames.Board },
    [constants_1.TableFields.order]: { type: Number, required: true, default: 0 },
    [constants_1.TableFields.dueDate]: { type: Date, default: null },
    [constants_1.TableFields.status]: {
        type: String,
        enum: Object.values(constants_1.CardStatus),
        default: constants_1.CardStatus.Todo,
    },
}, { timestamps: true });
cardSchema.index({ [constants_1.TableFields.listId]: 1, [constants_1.TableFields.order]: 1 });
cardSchema.index({ [constants_1.TableFields.boardId]: 1 });
cardSchema.index({ [constants_1.TableFields.boardId]: 1, [constants_1.TableFields.status]: 1 });
cardSchema.index({ [constants_1.TableFields.boardId]: 1, [constants_1.TableFields.title]: "text" });
cardSchema.path(constants_1.TableFields.dueDate).validate(function (v) {
    if (v == null)
        return true;
    return !isNaN(v.getTime());
}, "Invalid due date");
const Card = mongoose_1.default.model(constants_1.TableNames.Card, cardSchema);
exports.default = Card;
//# sourceMappingURL=card.js.map