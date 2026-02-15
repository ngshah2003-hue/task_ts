import mongoose from "mongoose";
import validator from "validator";
import { PASSWORD_REGEX, ValidationMsgs, TableNames, TableFields, UserTypes } from "../../utils/constants";
import ValidationError from "../../utils/ValidationError";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { IUserDoc } from "../../types";

interface IUserSchema {
  name?: string;
  email: string;
  password: string;
  tokens: Array<{ token: string }>;
  userType: number;
  active: boolean;
}

const userSchema = new mongoose.Schema<IUserSchema & IUserDoc>(
  {
    [TableFields.name_]: { type: String, trim: true },
    [TableFields.email]: {
      type: String,
      required: [true, ValidationMsgs.EmailEmpty],
      trim: true,
      unique: true,
      lowercase: true,
      validate(value: string) {
        if (!validator.isEmail(value)) throw new ValidationError(ValidationMsgs.EmailInvalid);
      },
    },
    [TableFields.password]: {
      type: String,
      minlength: [8, ValidationMsgs.PasswordMinLength],
      trim: true,
      required: [true, ValidationMsgs.PasswordEmpty],
    },
    [TableFields.tokens]: [
      { [TableFields.ID]: false, [TableFields.token]: { type: String } },
    ] as unknown as mongoose.SchemaDefinitionProperty<Array<{ token: string }>>,
    [TableFields.userType]: {
      type: Number,
      enum: Object.values(UserTypes),
      default: UserTypes.Customer,
    },
    [TableFields.active]: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        delete ret[TableFields.tokens];
        delete ret[TableFields.password];
        delete ret.__v;
      },
    },
  },
);

userSchema.methods.isValidAuth = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.isValidPassword = function (password: string): boolean {
  return PASSWORD_REGEX.test(password);
};

userSchema.methods.createAuthToken = function (interfaceType?: string): string {
  const payload: Record<string, string> = { [TableFields.ID]: this[TableFields.ID].toString() };
  if (interfaceType) payload[TableFields.interface] = interfaceType;
  return jwt.sign(payload, process.env.JWT_USER_PK as string);
};

userSchema.pre("save", async function (next) {
  if (this.isModified(TableFields.password)) {
    this[TableFields.password] = await bcrypt.hash(this[TableFields.password], 8);
  }
  next();
});

userSchema.index({ [TableFields.email]: 1 }, { unique: true });

const User = mongoose.model<IUserDoc>(TableNames.User, userSchema);
export default User;
