"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../utils/constants");
const ValidationError_1 = __importDefault(require("../../utils/ValidationError"));
const BoardService_1 = __importDefault(require("./BoardService"));
const list_1 = __importDefault(require("../models/list"));
const card_1 = __importDefault(require("../models/card"));
const ActivityService_1 = __importStar(require("./ActivityService"));
const ValidationMsgs = {
    ListNotFound: "List not found.",
    NotBoardOwner: "You do not have access to this board.",
};
class ListService {
    static async create(boardId, userId, body) {
        await BoardService_1.default.assertCanAccess(boardId, userId);
        const title = (body.title ?? "").toString().trim();
        if (!title)
            throw new ValidationError_1.default("List title is required.");
        const maxOrder = await list_1.default.findOne({ [constants_1.TableFields.boardId]: boardId })
            .sort({ [constants_1.TableFields.order]: -1 })
            .select(constants_1.TableFields.order)
            .lean();
        const order = (maxOrder?.order ?? -1) + 1;
        const list = new list_1.default({
            [constants_1.TableFields.title]: title,
            [constants_1.TableFields.boardId]: boardId,
            [constants_1.TableFields.order]: order,
        });
        await list.save();
        await ActivityService_1.default.log({
            boardId,
            userId,
            actionType: ActivityService_1.ActivityActionTypes.ListCreated,
            listId: list._id,
            listTitle: list.title,
        });
        return list;
    }
    static async update(boardId, listId, userId, body) {
        await BoardService_1.default.assertCanAccess(boardId, userId);
        const list = await list_1.default.findOne({ _id: listId, [constants_1.TableFields.boardId]: boardId });
        if (!list)
            throw new ValidationError_1.default(ValidationMsgs.ListNotFound);
        if (body.title !== undefined)
            list.title = body.title.trim();
        if (body.order !== undefined)
            list.order = body.order;
        await list.save();
        return list;
    }
    static async delete(boardId, listId, userId) {
        await BoardService_1.default.assertCanAccess(boardId, userId);
        const list = await list_1.default.findOne({ _id: listId, [constants_1.TableFields.boardId]: boardId });
        if (!list)
            throw new ValidationError_1.default(ValidationMsgs.ListNotFound);
        await ActivityService_1.default.log({
            boardId,
            userId,
            actionType: ActivityService_1.ActivityActionTypes.ListDeleted,
            listTitle: list.title,
        });
        await card_1.default.deleteMany({ [constants_1.TableFields.listId]: listId });
        await list_1.default.deleteOne({ _id: listId });
    }
}
exports.default = ListService;
//# sourceMappingURL=ListService.js.map