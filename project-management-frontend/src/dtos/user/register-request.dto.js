class RegisterRequestDTO {
    constructor(
        firstName,
        lastName,
        username,
        email,
        password,
        repeatPassword,
    ) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.username = username;
        this.email = email;
        this.password = password;
        this.repeatPassword = repeatPassword;
    }
}

export default RegisterRequestDTO;
