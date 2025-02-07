import CustomError from './custom.error.js';

class ValidationError extends CustomError {
    constructor(message = 'ValidationError') {
        super(message);
    }
}

export default ValidationError;
