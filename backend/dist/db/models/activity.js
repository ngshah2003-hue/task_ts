"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityActionTypes = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const constants_1 = require("../../utils/constants");
exports.ActivityActionTypes = {
    CardCreated: "card_created",
    CardMoved: "card_moved",
    CardUpdated: "card_updated",
    CardDeleted: "card_deleted",
    ListCreated: "list_created",
    ListDeleted: "list_deleted",
};
const activitySchema = new mongoose_1.default.Schema({
    [constants_1.TableFields.boardId]: { type: mongoose_1.default.Schema.Types.ObjectId, required: true, ref: constants_1.TableNames.Board },
    [constants_1.TableFields.userId]: { type: mongoose_1.default.Schema.Types.ObjectId, required: true, ref: constants_1.TableNames.User },
    [constants_1.TableFields.actionType]: { type: String, required: true },
    [constants_1.TableFields.cardId]: { type: mongoose_1.default.Schema.Types.ObjectId, ref: constants_1.TableNames.Card },
    [constants_1.TableFields.cardTitle]: { type: String },
    [constants_1.TableFields.listId]: { type: mongoose_1.default.Schema.Types.ObjectId, ref: constants_1.TableNames.List },
    [constants_1.TableFields.listTitle]: { type: String },
    [constants_1.TableFields.fromListTitle]: { type: String },
    [constants_1.TableFields.toListTitle]: { type: String },
}, { timestamps: true });
activitySchema.index({ [constants_1.TableFields.boardId]: 1, createdAt: -1 });
const Activity = mongoose_1.default.model(constants_1.TableNames.Activity, activitySchema);
exports.default = Activity;
//# sourceMappingURL=activity.js.map