export const UserTypes = {
  Admin: 1,
  Customer: 2,
} as const;

export const InterfaceTypes = {
  Admin: { AdminWeb: "i1" },
  Customer: { CustomerApp: "i2" },
} as const;

export const AuthTypes = {
  Admin: 1,
  Customer: 2,
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

export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const TableNames = {
  Admin: "admins",
  User: "users",
  Board: "boards",
  List: "lists",
  Card: "cards",
  Activity: "activities",
  BoardMember: "boardmembers",
  BoardInvitation: "boardinvitations",
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
  owner: "owner",
  boardId: "boardId",
  listId: "listId",
  cardId: "cardId",
  title: "title",
  order: "order",
  dueDate: "dueDate",
  status: "status",
  actionType: "actionType",
  userId: "userId",
  cardTitle: "cardTitle",
  listTitle: "listTitle",
  fromListTitle: "fromListTitle",
  toListTitle: "toListTitle",
  invitedBy: "invitedBy",
  expiresAt: "expiresAt",
  role: "role",
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
