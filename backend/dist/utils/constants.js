"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseStatus = exports.TableFields = exports.TableNames = exports.ValidationMsgs = exports.AuthTypes = exports.InterfaceTypes = exports.UserTypes = void 0;
exports.UserTypes = {
    Admin: 1,
    Customer: 2,
    Driver: 3,
};
exports.InterfaceTypes = {
    Admin: { AdminWeb: "i1" },
    Customer: { CustomerApp: "i2" },
    Driver: { DriverApp: "i3" },
};
exports.AuthTypes = {
    Admin: 1,
    Customer: 2,
    Driver: 3,
};
exports.ValidationMsgs = {
    UserNotFound: "User Not Found",
    AuthFail: "Authentication failed. Please log in.",
    EmailEmpty: "Email is required!",
    PasswordEmpty: "Password cannot be blank.",
    UnableToLogin: "Incorrect email and/or password.",
    EmailInvalid: "Provided email address is invalid.",
    PasswordInvalid: "Password is invalid.",
    DuplicateEmail: "This email address is already in use.",
};
exports.TableNames = {
    Admin: "admins",
    User: "users",
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
};
exports.ResponseStatus = {
    Success: 200,
    BadRequest: 400,
    Unauthorized: 401,
    NotFound: 404,
    InternalServerError: 500,
};
//# sourceMappingURL=constants.js.map