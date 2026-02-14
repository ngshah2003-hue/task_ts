import { TableFields, UserTypes, ValidationMsgs } from "../../utils/constants";
import ValidationError from "../../utils/ValidationError";
import Admin from "../models/admin";
import type { IAdminDoc } from "../../types";

type Projection = Record<string, 1>;

class ProjectionBuilder {
  private projection: Projection = {};

  constructor(private methodToExecute: (this: Projection) => Promise<IAdminDoc | null>) {}

  withBasicInfo(): this {
    this.projection[TableFields.name_] = 1;
    this.projection[TableFields.ID] = 1;
    this.projection[TableFields.email] = 1;
    this.projection[TableFields.userType] = 1;
    this.projection[TableFields.active] = 1;
    return this;
  }

  withPassword(): this {
    this.projection[TableFields.password] = 1;
    return this;
  }

  withUserType(): this {
    this.projection[TableFields.userType] = 1;
    return this;
  }

  withApproved(): this {
    this.projection[TableFields.approved] = 1;
    return this;
  }

  async execute(): Promise<IAdminDoc | null> {
    return this.methodToExecute.call(this.projection);
  }
}

export default class AdminService {
  static findByEmail(email: string): ProjectionBuilder {
    return new ProjectionBuilder(async function (this: Projection) {
      return Admin.findOne({ [TableFields.email]: email }, this);
    });
  }

  static getUserByIdAndToken(adminId: string, token: string): ProjectionBuilder {
    return new ProjectionBuilder(async function (this: Projection) {
      return Admin.findOne(
        {
          [TableFields.ID]: adminId,
          [`${TableFields.tokens}.${TableFields.token}`]: token,
        },
        this,
      ).lean(false);
    });
  }

  static async saveAuthToken(adminId: import("mongoose").Types.ObjectId, token: string): Promise<void> {
    await Admin.updateOne(
      { [TableFields.ID]: adminId },
      { $push: { [TableFields.tokens]: { [TableFields.token]: token } } },
    );
  }

  static async removeAuth(adminId: import("mongoose").Types.ObjectId, authToken: string): Promise<void> {
    await Admin.updateOne(
      { [TableFields.ID]: adminId },
      { $pull: { [TableFields.tokens]: { [TableFields.token]: authToken } } },
    );
  }

  static async insertUserRecord(reqBody: Record<string, unknown>): Promise<IAdminDoc> {
    const email = `${(reqBody[TableFields.email] as string) ?? ""}`.trim().toLowerCase();
    const password = reqBody[TableFields.password] as string;
    if (!email) throw new ValidationError(ValidationMsgs.EmailEmpty);
    if (!password) throw new ValidationError(ValidationMsgs.PasswordEmpty);

    const exists = await Admin.exists({ [TableFields.email]: email });
    if (exists) throw new ValidationError(ValidationMsgs.DuplicateEmail);

    const admin = new Admin({
      [TableFields.email]: email,
      [TableFields.password]: password,
      [TableFields.name_]: (reqBody[TableFields.name_] as string) ?? "",
      [TableFields.approved]: true,
      [TableFields.userType]: UserTypes.Admin,
    });
    if (!admin.isValidPassword(password)) throw new ValidationError(ValidationMsgs.PasswordInvalid);
    await admin.save();
    return admin;
  }
}
