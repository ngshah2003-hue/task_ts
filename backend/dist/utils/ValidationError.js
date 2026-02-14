"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ValidationError extends Error {
    constructor(message, data) {
        super(message);
        this.name = "ValidationError";
        this.data = data;
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}
exports.default = ValidationError;
//# sourceMappingURL=ValidationError.js.map