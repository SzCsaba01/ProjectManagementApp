import CustomError from './custom.error.js';

class InvalidTokenError extends CustomError {
    constructor(message) {
        super(message, 403);
    }
}

export default InvalidTokenError;
