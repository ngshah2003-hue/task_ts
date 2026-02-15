import validator from "validator";
import { Request } from "express";
import UserService from "../db/services/UserService";
import { TableFields, ValidationMsgs, InterfaceTypes } from "../utils/constants";
import ValidationError from "../utils/ValidationError";
import type { IUserDoc } from "../types";

export async function signup(req: Request): Promise<{ user: IUserDoc; token: string }> {
  const user = await UserService.insertUserRecord(req.body);
  const interfaceType = InterfaceTypes.Customer.CustomerApp;
  const token = user.createAuthToken(interfaceType);
  await UserService.saveAuthToken(user[TableFields.ID], token);
  return { user, token };
}

export async function login(req: Request): Promise<{ user: IUserDoc; token: string }> {
  let email = req.body[TableFields.email];
  if (!email) throw new ValidationError(ValidationMsgs.EmailEmpty);
  email = `${email}`.trim().toLowerCase();
  if (!validator.isEmail(email)) throw new ValidationError(ValidationMsgs.EmailInvalid);

  const password = req.body[TableFields.password];
  if (!password) throw new ValidationError(ValidationMsgs.PasswordEmpty);

  const user = await UserService.findByEmail(email)
    .withPassword()
    .withBasicInfo()
    .withUserType()
    .execute();

  if (!user || !(await user.isValidAuth(password)) || !user[TableFields.active]) {
    throw new ValidationError(ValidationMsgs.UnableToLogin);
  }

  const interfaceType = InterfaceTypes.Customer.CustomerApp;
  const token = user.createAuthToken(interfaceType);
  await UserService.saveAuthToken(user[TableFields.ID], token);

  return { user, token };
}

export async function logout(req: Request): Promise<{ message: string }> {
  const headerToken = req.header("Authorization")!.replace("Bearer ", "");
  await UserService.removeAuth(req.user![TableFields.ID], headerToken);
  return { message: "Logged out" };
}

export async function me(req: Request): Promise<{ user: NonNullable<Request["user"]> }> {
  return { user: req.user! };
}
