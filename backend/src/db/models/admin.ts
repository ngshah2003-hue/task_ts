import mongoose from "mongoose";
import validator from "validator";
import { ValidationMsgs, TableNames, TableFields, UserTypes } from "../../utils/constants";
import ValidationError from "../../utils/ValidationError";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import type { IAdminDoc } from "../../types";

interface IAdminSchema {
  name?: string;
  image?: string;
  email: string;
  password: string;
  tokens: Array<{ token: string }>;
  userType: number;
  approved: boolean;
  active: boolean;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
}

const adminSchema = new mongoose.Schema<IAdminSchema & IAdminDoc>(
  {
    [TableFields.name_]: { type: String, trim: true },
    [TableFields.image]: { type: String, trim: true },
    [TableFields.email]: {
      type: String,
      required: [true, ValidationMsgs.EmailEmpty],
      trim: true,
      unique: true,
      lowercase: true,
      validate(value: string) {
        if (!validator.isEmail(value)) {
          throw new ValidationError(ValidationMsgs.EmailInvalid);
        }
      },
    },
    [TableFields.password]: {
      type: String,
      minlength: 8,
      trim: true,
      required: [true, ValidationMsgs.PasswordEmpty],
    },
    [TableFields.tokens]: [
      {
        [TableFields.ID]: false,
        [TableFields.token]: { type: String },
      },
    ] as unknown as mongoose.SchemaDefinitionProperty<Array<{ token: string }>>,
    [TableFields.userType]: {
      type: Number,
      enum: Object.values(UserTypes),
    },
    [TableFields.approved]: { type: Boolean, default: false },
    [TableFields.active]: { type: Boolean, default: true },
    [TableFields.passwordResetToken]: { type: String, trim: true },
    [TableFields.passwordResetExpires]: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        delete ret[TableFields.tokens];
        delete ret[TableFields.passwordResetToken];
        delete ret[TableFields.passwordResetExpires];
        delete ret[TableFields.password];
        delete ret.createdAt;
        delete ret.updatedAt;
        delete ret.__v;
      },
    },
  },
);

adminSchema.methods.isValidAuth = async function (password: string): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

adminSchema.methods.isValidPassword = function (password: string): boolean {
  const regEx = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regEx.test(password);
};

adminSchema.methods.createAuthToken = function (): string {
  return jwt.sign(
    { [TableFields.ID]: this[TableFields.ID].toString() },
    process.env.JWT_ADMIN_PK as string,
  );
};

adminSchema.methods.createPasswordResetToken = function (): string {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this[TableFields.passwordResetToken] = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this[TableFields.passwordResetExpires] = new Date(Date.now() + 3600000);
  return resetToken;
};

adminSchema.pre("save", async function (next) {
  if (this.isModified(TableFields.password)) {
    this[TableFields.password] = await bcrypt.hash(this[TableFields.password], 8);
  }
  next();
});

adminSchema.index({ [TableFields.email]: 1 }, { unique: true });

const Admin = mongoose.model<IAdminDoc>(TableNames.Admin, adminSchema);
export default Admin;
