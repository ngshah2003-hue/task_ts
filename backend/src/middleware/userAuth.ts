import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import {
  TableFields,
  InterfaceTypes,
  AuthTypes,
  ValidationMsgs,
  ResponseStatus,
} from "../utils/constants";
import Util from "../utils/util";
import ValidationError from "../utils/ValidationError";
import UserService from "../db/services/UserService";

const auth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(ResponseStatus.Unauthorized).send(
        Util.getErrorMessageFromString(ValidationMsgs.AuthFail),
      );
      return;
    }
    const headerToken = authHeader.replace("Bearer ", "");
    const decoded = jwt.verify(headerToken, process.env.JWT_USER_PK as string) as Record<string, string>;
    const user = await UserService.getUserByIdAndToken(decoded[TableFields.ID], headerToken)
      .withBasicInfo()
      .withUserType()
      .execute();

    if (!user) throw new ValidationError(ValidationMsgs.UserNotFound);
    if (!user[TableFields.active]) {
      res.status(ResponseStatus.Unauthorized).send(
        Util.getErrorMessageFromString(ValidationMsgs.AuthFail),
      );
      return;
    }

    req.user = user;
    (req.user as unknown as Record<string, number>)[TableFields.authType] = AuthTypes.Customer;
    (req as Request & { interface?: string })[TableFields.interface] =
      decoded[TableFields.interface] ?? InterfaceTypes.Customer.CustomerApp;
    next();
  } catch (e) {
    if (!(e instanceof ValidationError)) console.error(e);
    res.status(ResponseStatus.Unauthorized).send(
      Util.getErrorMessageFromString(ValidationMsgs.AuthFail),
    );
  }
};

export default auth;
