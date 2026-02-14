"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Util = class {
    static getErrorMessage(mongooseException) {
        try {
            if (mongooseException.errors) {
                const mainJSONKeys = Object.keys(mongooseException.errors);
                const firstError = mongooseException.errors[mainJSONKeys[0]];
                if (firstError?.errors) {
                    const jsonKeys = Object.keys(firstError.errors);
                    return {
                        error: firstError.errors[jsonKeys[0]]?.properties?.message ??
                            firstError.errors[jsonKeys[0]]?.message ??
                            firstError.message ??
                            "Unknown error",
                    };
                }
                return { error: firstError?.message ?? "Unknown error" };
            }
            return { error: mongooseException.message };
        }
        catch {
            return { error: mongooseException.message };
        }
    }
    static getErrorMessageFromString(message) {
        return { error: message };
    }
    static getBaseURL() {
        const baseURL = process.env.HOST || "http://127.0.0.1";
        if (!Util.useProductionSettings()) {
            return `${baseURL}:${process.env.PORT || 8000}`;
        }
        return baseURL;
    }
    static useProductionSettings() {
        return `${process.env.isProd ?? process.env.NODE_ENV}`.toLowerCase() === "true";
    }
    static parseBoolean(b) {
        return `${b}`.toLowerCase() === "true";
    }
};
exports.default = Util;
//# sourceMappingURL=util.js.map