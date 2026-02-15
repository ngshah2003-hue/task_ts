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
require("./types");
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const cors_1 = __importDefault(require("cors"));
const chalk_1 = __importDefault(require("chalk"));
const DBController = __importStar(require("./db/mongoose"));
const util_1 = __importDefault(require("./utils/util"));
const morgan_1 = __importDefault(require("./utils/morgan"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(morgan_1.default.successHandler);
app.use(morgan_1.default.errorHandler);
app.use(express_1.default.urlencoded({
    extended: false,
    limit: "10mb",
    parameterLimit: 5000,
}));
app.use(express_1.default.json({ limit: "10mb" }));
const routesPath = path_1.default.join(__dirname, "routes");
fs_1.default.readdirSync(routesPath).forEach((file) => {
    if (path_1.default.extname(file) === ".js") {
        const mod = require(path_1.default.join(routesPath, file));
        app.use(mod.default ?? mod);
    }
});
app.get("/", (_req, res) => {
    res.sendStatus(200);
});
DBController.initConnection(() => {
    const httpServer = require("http").createServer(app);
    httpServer.listen(process.env.PORT, () => {
        console.log(chalk_1.default.cyan.italic.underline(`Server running on ${util_1.default.getBaseURL()}`));
    });
});
//# sourceMappingURL=app.js.map