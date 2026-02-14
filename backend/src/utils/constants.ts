export const UserTypes = {
  Admin: 1,
  Customer: 2,
  Driver: 3,
} as const;

export const InterfaceTypes = {
  Admin: { AdminWeb: "i1" },
  Customer: { CustomerApp: "i2" },
  Driver: { DriverApp: "i3" },
} as const;

export const AuthTypes = {
  Admin: 1,
  Customer: 2,
  Driver: 3,
} as const;

export const ValidationMsgs = {
  UserNotFound: "User Not Found",
  AuthFail: "Authentication failed. Please log in.",
  EmailEmpty: "Email is required!",
  PasswordEmpty: "Password cannot be blank.",
  UnableToLogin: "Incorrect email and/or password.",
  EmailInvalid: "Provided email address is invalid.",
  PasswordInvalid: "Password is invalid.",
  DuplicateEmail: "This email address is already in use.",
} as const;

export const TableNames = {
  Admin: "admins",
  User: "users",
} as const;

export const TableFields = {
  ID: "_id",
  name_: "name",
  email: "email",
  password: "password",
  tokens: "tokens",
  token: "token",
  approved: "approved",
  active: "active",
  userType: "userType",
  interface: "interface",
  authType: "authType",
  image: "image",
  passwordResetToken: "passwordResetToken",
  passwordResetExpires: "passwordResetExpires",
} as const;

export const ResponseStatus = {
  Success: 200,
  BadRequest: 400,
  Unauthorized: 401,
  NotFound: 404,
  InternalServerError: 500,
} as const;
