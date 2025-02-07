class ChangePasswordRequestDTO {
    constructor(forgotPasswordToken, newPassword, repeateNewPassword) {
        this.forgotPasswordToken = forgotPasswordToken;
        this.newPassword = newPassword;
        this.repeatNewPassword = repeateNewPassword;
    }

    validate() {
        if (!this.forgotPasswordToken) {
            throw new ValidationError(
                'Something went wrong! Please try again later!',
            );
        }

        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
        if (!passwordRegex.test(this.newPassword)) {
            throw new ValidationError(
                'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
            );
        }

        if (this.password !== this.repeatNewPasswordPassword) {
            throw new ValidationError("Passwords don't match.");
        }
    }
}

export default ChangePasswordRequestDTO;
