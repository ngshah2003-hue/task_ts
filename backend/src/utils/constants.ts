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
  EmailEmpty: "Email is required.",
  EmailInvalid: "Email is not valid.",
  PasswordEmpty: "Password is required.",
  PasswordMinLength: "Must be minimum 8 characters.",
  PasswordInvalid: "Password must include uppercase, lowercase, number and special character.",
  UnableToLogin: "Incorrect email and/or password.",
  DuplicateEmail: "This email address is already in use.",
  NameEmpty: "Name is required.",
  NameTooLong: "Name is too long.",
} as const;

/** Same as frontend: upper, lower, number, special, min 8 */
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const TableNames = {
  Admin: "admins",
  User: "users",
  Board: "boards",
  List: "lists",
  Card: "cards",
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
  // Kanban
  owner: "owner",
  boardId: "boardId",
  listId: "listId",
  title: "title",
  order: "order",
  dueDate: "dueDate",
  status: "status",
} as const;

export const CardStatus = {
  Todo: "todo",
  InProgress: "in_progress",
  Done: "done",
} as const;

export const ResponseStatus = {
  Success: 200,
  BadRequest: 400,
  Unauthorized: 401,
  NotFound: 404,
  InternalServerError: 500,
} as const;
