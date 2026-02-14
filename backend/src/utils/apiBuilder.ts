import express, { Request, Response, RequestHandler } from "express";
import adminAuth from "../middleware/adminAuth";
import userAuth from "../middleware/userAuth";
import Util, { MongooseError } from "../utils/util";
import { ResponseStatus } from "../utils/constants";
import ValidationError from "../utils/ValidationError";

type Executer = (req: Request, res: Response) => Promise<unknown>;

class API {
  static configRoute(root: string): PathBuilder {
    const router = express.Router();
    return new PathBuilder(root, router);
  }
}

class MethodBuilder {
  constructor(
    private root: string,
    private subPath: string,
    private router: express.Router,
  ) {}

  asGET(methodToExecute: Executer): Builder {
    return new Builder("get", this.root, this.subPath, methodToExecute, this.router);
  }
  asPOST(methodToExecute: Executer): Builder {
    return new Builder("post", this.root, this.subPath, methodToExecute, this.router);
  }
  asDELETE(methodToExecute: Executer): Builder {
    return new Builder("delete", this.root, this.subPath, methodToExecute, this.router);
  }
  asUPDATE(methodToExecute: Executer): Builder {
    return new Builder("patch", this.root, this.subPath, methodToExecute, this.router);
  }
}

class PathBuilder {
  constructor(
    private root: string,
    private router: express.Router,
  ) {}

  addPath(subPath: string): MethodBuilder {
    return new MethodBuilder(this.root, subPath, this.router);
  }
  getRouter(): express.Router {
    return this.router;
  }
}

class Builder {
  constructor(
    private methodType: "get" | "post" | "delete" | "patch",
    private root: string,
    private subPath: string,
    private executer: Executer,
    private router: express.Router,
    private middlewaresList: RequestHandler[] = [],
    private adminAuthFlag = false,
    private userAuthFlag = false,
  ) {}

  useAdminAuth(): Builder {
    return new Builder(
      this.methodType,
      this.root,
      this.subPath,
      this.executer,
      this.router,
      this.middlewaresList,
      true,
      this.userAuthFlag,
    );
  }

  useUserAuth(): Builder {
    return new Builder(
      this.methodType,
      this.root,
      this.subPath,
      this.executer,
      this.router,
      this.middlewaresList,
      this.adminAuthFlag,
      true,
    );
  }

  userMiddlewares(...middlewares: RequestHandler[]): Builder {
    return new Builder(
      this.methodType,
      this.root,
      this.subPath,
      this.executer,
      this.router,
      [...middlewares],
      this.adminAuthFlag,
      this.userAuthFlag,
    );
  }

  build(): PathBuilder {
    const controller: RequestHandler = async (req: Request, res: Response): Promise<void> => {
      try {
        const response = await this.executer(req, res);
        res.status(ResponseStatus.Success).send(response);
      } catch (e) {
        if (e && (e as Error).name !== ValidationError.name) {
          console.error(e);
        }
        (res.locals as { errorMessage?: Error }).errorMessage = e as Error;
        const status =
          e && (e as Error).name === ValidationError.name
            ? ResponseStatus.BadRequest
            : ResponseStatus.InternalServerError;
        res.status(status).send(Util.getErrorMessage(e as MongooseError));
      }
    };

    const middlewares: RequestHandler[] = [...this.middlewaresList];
    if (this.adminAuthFlag) middlewares.push(adminAuth as RequestHandler);
    if (this.userAuthFlag) middlewares.push(userAuth as RequestHandler);

    (this.router as express.IRouter)[this.methodType](this.root + this.subPath, ...middlewares, controller);
    return new PathBuilder(this.root, this.router);
  };
}

export default API;
