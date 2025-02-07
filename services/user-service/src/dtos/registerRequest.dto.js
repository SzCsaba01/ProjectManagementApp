import { ValidationError } from '../errors/index.js';

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

    validate() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.email)) {
            throw new ValidationError('Invalid email format.');
        }

        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
        if (!passwordRegex.test(this.password)) {
            throw new ValidationError(
                'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
            );
        }

        if (this.password !== this.repeatPassword) {
            throw new ValidationError("Passwords don't match.");
        }

        if (!this.firstName || this.firstName.length > 50) {
            throw new ValidationError(
                'First name must be maximum 50 characters long.',
            );
        }

        if (!this.lastName || this.lastName.length > 50) {
            throw new ValidationError(
                'Last name must be maximum 50 characters long.',
            );
        }

        if (!this.username || this.username.length < 3) {
            throw new ValidationError(
                'Username must be at least 3 characters long.',
            );
        }

        if (this.username.length > 30) {
            throw new ValidationError(
                'Username must be maximum 30 characters long.',
            );
        }
    }
}

export default RegisterRequestDTO;
