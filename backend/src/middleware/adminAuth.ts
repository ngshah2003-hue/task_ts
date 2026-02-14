import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import {
  TableFields,
  UserTypes,
  InterfaceTypes,
  AuthTypes,
  ValidationMsgs,
  ResponseStatus,
} from "../utils/constants";
import Util from "../utils/util";
import ValidationError from "../utils/ValidationError";
import AdminService from "../db/services/AdminService";

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
    const decoded = jwt.verify(headerToken, process.env.JWT_ADMIN_PK as string) as Record<string, string>;
    const admin = await AdminService.getUserByIdAndToken(decoded[TableFields.ID], headerToken)
      .withBasicInfo()
      .withApproved()
      .execute();

    if (!admin) throw new ValidationError(ValidationMsgs.UserNotFound);
    if (admin[TableFields.approved] !== true) {
      res.status(ResponseStatus.Unauthorized).send(
        Util.getErrorMessageFromString(ValidationMsgs.AuthFail),
      );
      return;
    }

    req.user = admin;
    (req.user as unknown as Record<string, number>)[TableFields.userType] = UserTypes.Admin;
    (req.user as unknown as Record<string, number>)[TableFields.authType] = AuthTypes.Admin;
    (req as Request & { interface?: string })[TableFields.interface] =
      decoded[TableFields.interface] ?? InterfaceTypes.Admin.AdminWeb;
    next();
  } catch (e) {
    if (!(e instanceof ValidationError)) console.error(e);
    res.status(ResponseStatus.Unauthorized).send(
      Util.getErrorMessageFromString(ValidationMsgs.AuthFail),
    );
  }
};

export default auth;
