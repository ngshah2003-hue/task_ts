"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mongoose = exports.MongoUtil = void 0;
exports.initConnection = initConnection;
const mongoose_1 = __importDefault(require("mongoose"));
exports.mongoose = mongoose_1.default;
const chalk_1 = __importDefault(require("chalk"));
mongoose_1.default.connection.on("connected", () => {
    console.log(chalk_1.default.blue.bold("Database Connection Established✅"));
});
mongoose_1.default.connection.on("reconnected", () => {
    console.log("Database Connection Reestablished");
});
mongoose_1.default.connection.on("disconnected", () => {
    console.log("Database Connection Disconnected");
});
mongoose_1.default.connection.on("close", () => {
    console.log("Database Connection Closed");
});
mongoose_1.default.connection.on("error", (error) => {
    console.log(chalk_1.default.bgRed.bold("⚠️ [Database ERROR]") + chalk_1.default.red(error));
});
class MongoUtil {
    static newObjectId() {
        return new mongoose_1.default.Types.ObjectId();
    }
    static toObjectId(stringId) {
        return new mongoose_1.default.Types.ObjectId(stringId);
    }
    static isValidObjectID(id) {
        return mongoose_1.default.isValidObjectId(id);
    }
}
exports.MongoUtil = MongoUtil;
function initConnection(callback) {
    if (process.env.isProduction === "true") {
    }
    mongoose_1.default.connect(process.env.Database_URL);
    const db = mongoose_1.default.connection;
    db.once("open", () => {
        callback();
    });
}
//# sourceMappingURL=mongoose.js.map