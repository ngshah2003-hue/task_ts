"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseStatus = exports.CardStatus = exports.TableFields = exports.TableNames = exports.PASSWORD_REGEX = exports.ValidationMsgs = exports.AuthTypes = exports.InterfaceTypes = exports.UserTypes = void 0;
exports.UserTypes = {
    Admin: 1,
    Customer: 2,
};
exports.InterfaceTypes = {
    Admin: { AdminWeb: "i1" },
    Customer: { CustomerApp: "i2" },
};
exports.AuthTypes = {
    Admin: 1,
    Customer: 2,
};
exports.ValidationMsgs = {
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
};
exports.PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
exports.TableNames = {
    Admin: "admins",
    User: "users",
    Board: "boards",
    List: "lists",
    Card: "cards",
    Activity: "activities",
    BoardMember: "boardmembers",
    BoardInvitation: "boardinvitations",
};
exports.TableFields = {
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
};
exports.CardStatus = {
    Todo: "todo",
    InProgress: "in_progress",
    Done: "done",
};
exports.ResponseStatus = {
    Success: 200,
    BadRequest: 400,
    Unauthorized: 401,
    NotFound: 404,
    InternalServerError: 500,
};
//# sourceMappingURL=constants.js.map