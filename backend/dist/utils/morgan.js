"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const morgan_1 = __importDefault(require("morgan"));
const chalk_1 = __importDefault(require("chalk"));
const logger_1 = __importDefault(require("./logger"));
const isDev = process.env.NODE_ENV !== "production";
morgan_1.default.token("message", (_req, res) => res.locals.errorMessage?.message ?? "");
morgan_1.default.token("real-ip", (req) => (req.ip ?? req.connection?.remoteAddress ?? "").replace(/^::ffff:/, ""));
const getIpFormat = () => ":real-ip - ";
const formatWithColor = (tokens, req, res) => {
    const status = tokens.status(req, res);
    const method = tokens.method(req, res);
    const url = tokens.url(req, res);
    const responseTime = tokens["response-time"](req, res);
    const ip = tokens["real-ip"](req, res);
    const message = tokens.message(req, res);
    let statusColor = chalk_1.default.green;
    if (Number(status) >= 500)
        statusColor = chalk_1.default.red;
    else if (Number(status) >= 400)
        statusColor = chalk_1.default.yellow;
    else if (Number(status) >= 300)
        statusColor = chalk_1.default.cyan;
    return [
        chalk_1.default.gray(ip),
        chalk_1.default.blue(String(method).padEnd(6)),
        url,
        statusColor(String(status)),
        "-",
        chalk_1.default.magenta(`${responseTime} ms`),
        message ? chalk_1.default.red(`\n⛔ ${message}`) : "",
    ].join(" ");
};
const successHandler = isDev
    ? (0, morgan_1.default)(formatWithColor, {
        skip: (_req, res) => res.statusCode >= 400,
        stream: { write: (message) => logger_1.default.info(message.trim()) },
    })
    : (0, morgan_1.default)(`${getIpFormat()}:method :url :status - :response-time ms`, {
        skip: (_req, res) => res.statusCode >= 400,
        stream: { write: (message) => logger_1.default.info(message.trim()) },
    });
const errorHandler = isDev
    ? (0, morgan_1.default)(formatWithColor, {
        skip: (_req, res) => res.statusCode < 400,
        stream: { write: (message) => logger_1.default.error(message.trim()) },
    })
    : (0, morgan_1.default)(`${getIpFormat()}:method :url :status - :response-time ms - message: :message`, {
        skip: (_req, res) => res.statusCode < 400,
        stream: { write: (message) => logger_1.default.error(message.trim()) },
    });
exports.default = {
    successHandler,
    errorHandler,
};
//# sourceMappingURL=morgan.js.map