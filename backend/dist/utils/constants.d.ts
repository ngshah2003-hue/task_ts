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
    readonly EmailEmpty: "Email is required!";
    readonly PasswordEmpty: "Password cannot be blank.";
    readonly UnableToLogin: "Incorrect email and/or password.";
    readonly EmailInvalid: "Provided email address is invalid.";
    readonly PasswordInvalid: "Password is invalid.";
    readonly DuplicateEmail: "This email address is already in use.";
};
export declare const TableNames: {
    readonly Admin: "admins";
    readonly User: "users";
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
};
export declare const ResponseStatus: {
    readonly Success: 200;
    readonly BadRequest: 400;
    readonly Unauthorized: 401;
    readonly NotFound: 404;
    readonly InternalServerError: 500;
};
//# sourceMappingURL=constants.d.ts.map