import express, { Request, Response, RequestHandler } from "express";
type Executer = (req: Request, res: Response) => Promise<unknown>;
declare class API {
    static configRoute(root: string): PathBuilder;
}
declare class MethodBuilder {
    private root;
    private subPath;
    private router;
    constructor(root: string, subPath: string, router: express.Router);
    asGET(methodToExecute: Executer): Builder;
    asPOST(methodToExecute: Executer): Builder;
    asDELETE(methodToExecute: Executer): Builder;
    asUPDATE(methodToExecute: Executer): Builder;
}
declare class PathBuilder {
    private root;
    private router;
    constructor(root: string, router: express.Router);
    addPath(subPath: string): MethodBuilder;
    getRouter(): express.Router;
}
declare class Builder {
    private methodType;
    private root;
    private subPath;
    private executer;
    private router;
    private middlewaresList;
    private adminAuthFlag;
    private userAuthFlag;
    constructor(methodType: "get" | "post" | "delete" | "patch", root: string, subPath: string, executer: Executer, router: express.Router, middlewaresList?: RequestHandler[], adminAuthFlag?: boolean, userAuthFlag?: boolean);
    useAdminAuth(): Builder;
    useUserAuth(): Builder;
    userMiddlewares(...middlewares: RequestHandler[]): Builder;
    build(): PathBuilder;
}
export default API;
//# sourceMappingURL=apiBuilder.d.ts.map