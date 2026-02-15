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
const apiBuilder_1 = __importDefault(require("../utils/apiBuilder"));
const BoardController = __importStar(require("../controllers/BoardController"));
const ListController = __importStar(require("../controllers/ListController"));
const CardController = __importStar(require("../controllers/CardController"));
const ActivityController = __importStar(require("../controllers/ActivityController"));
const BoardMemberController = __importStar(require("../controllers/BoardMemberController"));
const router = apiBuilder_1.default.configRoute("/user")
    .addPath("/boards")
    .asGET(BoardController.list)
    .useUserAuth()
    .build()
    .addPath("/boards")
    .asPOST(BoardController.create)
    .useUserAuth()
    .build()
    .addPath("/boards/:boardId")
    .asGET(BoardController.getOne)
    .useUserAuth()
    .build()
    .addPath("/activity")
    .asGET(ActivityController.listForUser)
    .useUserAuth()
    .build()
    .addPath("/boards/:boardId/activity")
    .asGET(ActivityController.listByBoard)
    .useUserAuth()
    .build()
    .addPath("/boards/:boardId")
    .asDELETE(BoardController.remove)
    .useUserAuth()
    .build()
    .addPath("/boards/:boardId/invite")
    .asPOST(BoardMemberController.invite)
    .useUserAuth()
    .build()
    .addPath("/boards/:boardId/members")
    .asGET(BoardMemberController.listMembers)
    .useUserAuth()
    .build()
    .addPath("/boards/:boardId/members/:userId")
    .asDELETE(BoardMemberController.removeMember)
    .useUserAuth()
    .build()
    .addPath("/boards/:boardId/invitations/:invitationId")
    .asDELETE(BoardMemberController.cancelInvite)
    .useUserAuth()
    .build()
    .addPath("/boards/:boardId/lists")
    .asPOST(ListController.create)
    .useUserAuth()
    .build()
    .addPath("/boards/:boardId/lists/:listId")
    .asUPDATE(ListController.update)
    .useUserAuth()
    .build()
    .addPath("/boards/:boardId/lists/:listId")
    .asDELETE(ListController.remove)
    .useUserAuth()
    .build()
    .addPath("/boards/:boardId/lists/:listId/cards")
    .asPOST(CardController.create)
    .useUserAuth()
    .build()
    .addPath("/boards/:boardId/cards")
    .asGET(CardController.listByBoard)
    .useUserAuth()
    .build()
    .addPath("/cards/:cardId")
    .asUPDATE(CardController.update)
    .useUserAuth()
    .build()
    .addPath("/cards/:cardId")
    .asDELETE(CardController.remove)
    .useUserAuth()
    .build()
    .addPath("/cards/:cardId/move")
    .asUPDATE(CardController.move)
    .useUserAuth()
    .build()
    .getRouter();
exports.default = router;
//# sourceMappingURL=boardRoutes.js.map