import validator from "validator";
import { PASSWORD_REGEX, TableFields, UserTypes, ValidationMsgs } from "../../utils/constants";
import ValidationError from "../../utils/ValidationError";
import User from "../models/user";
import type { IUserDoc } from "../../types";

type Projection = Record<string, 1>;

class ProjectionBuilder {
  private projection: Projection = {};

  constructor(private methodToExecute: (this: Projection) => Promise<IUserDoc | null>) {}

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

  async execute(): Promise<IUserDoc | null> {
    return this.methodToExecute.call(this.projection);
  }
}

export default class UserService {
  static findByEmail(email: string): ProjectionBuilder {
    return new ProjectionBuilder(async function (this: Projection) {
      return User.findOne({ [TableFields.email]: email }, this);
    });
  }

  static getUserByIdAndToken(userId: string, token: string): ProjectionBuilder {
    return new ProjectionBuilder(async function (this: Projection) {
      return User.findOne(
        {
          [TableFields.ID]: userId,
          [`${TableFields.tokens}.${TableFields.token}`]: token,
        },
        this,
      ).lean(false);
    });
  }

  static async saveAuthToken(userId: import("mongoose").Types.ObjectId, token: string): Promise<void> {
    await User.updateOne(
      { [TableFields.ID]: userId },
      { $push: { [TableFields.tokens]: { [TableFields.token]: token } } },
    );
  }

  static async removeAuth(userId: import("mongoose").Types.ObjectId, authToken: string): Promise<void> {
    await User.updateOne(
      { [TableFields.ID]: userId },
      { $pull: { [TableFields.tokens]: { [TableFields.token]: authToken } } },
    );
  }

  static async insertUserRecord(reqBody: Record<string, unknown>): Promise<IUserDoc> {
    const name = `${(reqBody[TableFields.name_] as string) ?? ""}`.trim();
    const email = `${(reqBody[TableFields.email] as string) ?? ""}`.trim().toLowerCase();
    const password: string = typeof reqBody[TableFields.password] === "string" ? (reqBody[TableFields.password] as string) : "";

    if (!name) throw new ValidationError(ValidationMsgs.NameEmpty);
    if (name.length > 100) throw new ValidationError(ValidationMsgs.NameTooLong);
    if (!email) throw new ValidationError(ValidationMsgs.EmailEmpty);
    if (!validator.isEmail(email)) throw new ValidationError(ValidationMsgs.EmailInvalid);
    if (!password) throw new ValidationError(ValidationMsgs.PasswordEmpty);
    if (password.length < 8) throw new ValidationError(ValidationMsgs.PasswordMinLength);
    if (!PASSWORD_REGEX.test(password)) throw new ValidationError(ValidationMsgs.PasswordInvalid);

    const exists = await User.exists({ [TableFields.email]: email });
    if (exists) throw new ValidationError(ValidationMsgs.DuplicateEmail);

    const userType = (reqBody[TableFields.userType] as number) ?? UserTypes.Customer;
    const user = new User({
      [TableFields.email]: email,
      [TableFields.password]: password,
      [TableFields.name_]: name,
      [TableFields.userType]: userType,
    });
    await user.save();
    return user;
  }
}
