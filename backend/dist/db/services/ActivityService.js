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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityActionTypes = void 0;
const constants_1 = require("../../utils/constants");
const activity_1 = __importStar(require("../models/activity"));
Object.defineProperty(exports, "ActivityActionTypes", { enumerable: true, get: function () { return activity_1.ActivityActionTypes; } });
class ActivityService {
    static async log(params) {
        const doc = {
            [constants_1.TableFields.boardId]: params.boardId,
            [constants_1.TableFields.userId]: params.userId,
            [constants_1.TableFields.actionType]: params.actionType,
        };
        if (params.cardId != null)
            doc[constants_1.TableFields.cardId] = params.cardId;
        if (params.cardTitle != null)
            doc[constants_1.TableFields.cardTitle] = params.cardTitle;
        if (params.listId != null)
            doc[constants_1.TableFields.listId] = params.listId;
        if (params.listTitle != null)
            doc[constants_1.TableFields.listTitle] = params.listTitle;
        if (params.fromListTitle != null)
            doc[constants_1.TableFields.fromListTitle] = params.fromListTitle;
        if (params.toListTitle != null)
            doc[constants_1.TableFields.toListTitle] = params.toListTitle;
        await activity_1.default.create(doc);
    }
    static async listByBoard(boardId, userId, page = 1, limit = 30) {
        const BoardService = (await Promise.resolve().then(() => __importStar(require("./BoardService")))).default;
        const board = await BoardService.getById(boardId, userId);
        if (!board)
            return { activities: [], total: 0, totalPages: 0 };
        const skip = (Math.max(1, page) - 1) * Math.min(50, Math.max(1, limit));
        const cap = Math.min(50, Math.max(1, limit));
        const [activities, total] = await Promise.all([
            activity_1.default.find({ [constants_1.TableFields.boardId]: boardId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(cap)
                .populate(constants_1.TableFields.userId, "name email")
                .lean(),
            activity_1.default.countDocuments({ [constants_1.TableFields.boardId]: boardId }),
        ]);
        return {
            activities: activities,
            total,
            totalPages: Math.ceil(total / cap) || 1,
        };
    }
    static async listForUser(userId, page = 1, limit = 30) {
        const BoardService = (await Promise.resolve().then(() => __importStar(require("./BoardService")))).default;
        const boards = await BoardService.listByOwner(userId);
        const boardIds = boards.map((b) => b._id);
        if (boardIds.length === 0)
            return { activities: [], total: 0, totalPages: 0 };
        const skip = (Math.max(1, page) - 1) * Math.min(50, Math.max(1, limit));
        const cap = Math.min(50, Math.max(1, limit));
        const [activities, total] = await Promise.all([
            activity_1.default.find({ [constants_1.TableFields.boardId]: { $in: boardIds } })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(cap)
                .populate(constants_1.TableFields.userId, "name email")
                .populate(constants_1.TableFields.boardId, "title")
                .lean(),
            activity_1.default.countDocuments({ [constants_1.TableFields.boardId]: { $in: boardIds } }),
        ]);
        return {
            activities: activities,
            total,
            totalPages: Math.ceil(total / cap) || 1,
        };
    }
}
exports.default = ActivityService;
//# sourceMappingURL=ActivityService.js.map