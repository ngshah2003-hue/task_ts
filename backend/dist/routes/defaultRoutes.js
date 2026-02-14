"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const apiBuilder_1 = __importDefault(require("../utils/apiBuilder"));
const router = apiBuilder_1.default.configRoute("/api")
    .addPath("/health")
    .asGET(async () => ({ status: "ok", timestamp: new Date().toISOString() }))
    .build()
    .getRouter();
exports.default = router;
//# sourceMappingURL=defaultRoutes.js.map