"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const adminAuth_1 = __importDefault(require("../middleware/adminAuth"));
const userAuth_1 = __importDefault(require("../middleware/userAuth"));
const util_1 = __importDefault(require("../utils/util"));
const constants_1 = require("../utils/constants");
const ValidationError_1 = __importDefault(require("../utils/ValidationError"));
class API {
    static configRoute(root) {
        const router = express_1.default.Router();
        return new PathBuilder(root, router);
    }
}
class MethodBuilder {
    constructor(root, subPath, router) {
        this.root = root;
        this.subPath = subPath;
        this.router = router;
    }
    asGET(methodToExecute) {
        return new Builder("get", this.root, this.subPath, methodToExecute, this.router);
    }
    asPOST(methodToExecute) {
        return new Builder("post", this.root, this.subPath, methodToExecute, this.router);
    }
    asDELETE(methodToExecute) {
        return new Builder("delete", this.root, this.subPath, methodToExecute, this.router);
    }
    asUPDATE(methodToExecute) {
        return new Builder("patch", this.root, this.subPath, methodToExecute, this.router);
    }
}
class PathBuilder {
    constructor(root, router) {
        this.root = root;
        this.router = router;
    }
    addPath(subPath) {
        return new MethodBuilder(this.root, subPath, this.router);
    }
    getRouter() {
        return this.router;
    }
}
class Builder {
    constructor(methodType, root, subPath, executer, router, middlewaresList = [], adminAuthFlag = false, userAuthFlag = false) {
        this.methodType = methodType;
        this.root = root;
        this.subPath = subPath;
        this.executer = executer;
        this.router = router;
        this.middlewaresList = middlewaresList;
        this.adminAuthFlag = adminAuthFlag;
        this.userAuthFlag = userAuthFlag;
    }
    useAdminAuth() {
        return new Builder(this.methodType, this.root, this.subPath, this.executer, this.router, this.middlewaresList, true, this.userAuthFlag);
    }
    useUserAuth() {
        return new Builder(this.methodType, this.root, this.subPath, this.executer, this.router, this.middlewaresList, this.adminAuthFlag, true);
    }
    userMiddlewares(...middlewares) {
        return new Builder(this.methodType, this.root, this.subPath, this.executer, this.router, [...middlewares], this.adminAuthFlag, this.userAuthFlag);
    }
    build() {
        const controller = async (req, res) => {
            try {
                const response = await this.executer(req, res);
                res.status(constants_1.ResponseStatus.Success).send(response);
            }
            catch (e) {
                if (e && e.name !== ValidationError_1.default.name) {
                    console.error(e);
                }
                res.locals.errorMessage = e;
                const status = e && e.name === ValidationError_1.default.name
                    ? constants_1.ResponseStatus.BadRequest
                    : constants_1.ResponseStatus.InternalServerError;
                res.status(status).send(util_1.default.getErrorMessage(e));
            }
        };
        const middlewares = [...this.middlewaresList];
        if (this.adminAuthFlag)
            middlewares.push(adminAuth_1.default);
        if (this.userAuthFlag)
            middlewares.push(userAuth_1.default);
        this.router[this.methodType](this.root + this.subPath, ...middlewares, controller);
        return new PathBuilder(this.root, this.router);
    }
    ;
}
exports.default = API;
//# sourceMappingURL=apiBuilder.js.map