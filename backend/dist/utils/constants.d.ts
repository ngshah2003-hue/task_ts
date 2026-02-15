export declare const UserTypes: {
    readonly Admin: 1;
    readonly Customer: 2;
    readonly Driver: 3;
};
export declare const InterfaceTypes: {
    readonly Admin: {
        readonly AdminWeb: "i1";
    };
    readonly Customer: {
        readonly CustomerApp: "i2";
    };
    readonly Driver: {
        readonly DriverApp: "i3";
    };
};
export declare const AuthTypes: {
    readonly Admin: 1;
    readonly Customer: 2;
    readonly Driver: 3;
};
export declare const ValidationMsgs: {
    readonly UserNotFound: "User Not Found";
    readonly AuthFail: "Authentication failed. Please log in.";
    readonly EmailEmpty: "Email is required.";
    readonly EmailInvalid: "Email is not valid.";
    readonly PasswordEmpty: "Password is required.";
    readonly PasswordMinLength: "Must be minimum 8 characters.";
    readonly PasswordInvalid: "Password must include uppercase, lowercase, number and special character.";
    readonly UnableToLogin: "Incorrect email and/or password.";
    readonly DuplicateEmail: "This email address is already in use.";
    readonly NameEmpty: "Name is required.";
    readonly NameTooLong: "Name is too long.";
};
/** Same as frontend: upper, lower, number, special, min 8 */
export declare const PASSWORD_REGEX: RegExp;
export declare const TableNames: {
    readonly Admin: "admins";
    readonly User: "users";
    readonly Board: "boards";
    readonly List: "lists";
    readonly Card: "cards";
};
export declare const TableFields: {
    readonly ID: "_id";
    readonly name_: "name";
    readonly email: "email";
    readonly password: "password";
    readonly tokens: "tokens";
    readonly token: "token";
    readonly approved: "approved";
    readonly active: "active";
    readonly userType: "userType";
    readonly interface: "interface";
    readonly authType: "authType";
    readonly image: "image";
    readonly passwordResetToken: "passwordResetToken";
    readonly passwordResetExpires: "passwordResetExpires";
    readonly owner: "owner";
    readonly boardId: "boardId";
    readonly listId: "listId";
    readonly title: "title";
    readonly order: "order";
    readonly dueDate: "dueDate";
    readonly status: "status";
};
export declare const CardStatus: {
    readonly Todo: "todo";
    readonly InProgress: "in_progress";
    readonly Done: "done";
};
export declare const ResponseStatus: {
    readonly Success: 200;
    readonly BadRequest: 400;
    readonly Unauthorized: 401;
    readonly NotFound: 404;
    readonly InternalServerError: 500;
};
//# sourceMappingURL=constants.d.ts.map