class ChangePasswordRequestDTO {
    constructor(forgotPasswordToken, newPassword, repeatNewPassword) {
        this.forgotPasswordToken = forgotPasswordToken;
        this.newPassword = newPassword;
        this.repeatNewPassword = repeatNewPassword;
    }
}

export default ChangePasswordRequestDTO;
