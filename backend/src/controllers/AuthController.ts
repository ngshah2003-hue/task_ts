import { Request } from "express";
import AdminService from "../db/services/AdminService";
import { TableFields, ValidationMsgs } from "../utils/constants";
import ValidationError from "../utils/ValidationError";
import type { IAdminDoc } from "../types";

export async function signup(req: Request): Promise<{ user: IAdminDoc; token: string }> {
  const user = await AdminService.insertUserRecord(req.body);
  const token = user.createAuthToken();
  await AdminService.saveAuthToken(user[TableFields.ID], token);
  return { user, token };
}

export async function login(req: Request): Promise<{ user: IAdminDoc; token: string }> {
  let email = req.body[TableFields.email];
  if (!email) throw new ValidationError(ValidationMsgs.EmailEmpty);
  email = `${email}`.trim().toLowerCase();

  const password = req.body[TableFields.password];
  if (!password) throw new ValidationError(ValidationMsgs.PasswordEmpty);

  const user = await AdminService.findByEmail(email)
    .withPassword()
    .withBasicInfo()
    .withUserType()
    .withApproved()
    .execute();

  if (!user || !(await user.isValidAuth(password)) || !user[TableFields.active]) {
    throw new ValidationError(ValidationMsgs.UnableToLogin);
  }

  const token = user.createAuthToken();
  await AdminService.saveAuthToken(user[TableFields.ID], token);

  return { user, token };
}

export async function logout(req: Request): Promise<{ message: string }> {
  const headerToken = req.header("Authorization")!.replace("Bearer ", "");
  await AdminService.removeAuth(req.user![TableFields.ID], headerToken);
  return { message: "Logged out" };
}

export async function me(req: Request): Promise<{ user: NonNullable<Request["user"]> }> {
  return { user: req.user! };
}
