import CustomError from './custom.error.js';

class ValidationError extends CustomError {
    constructor(message = 'Validation Error!') {
        super(message);
    }
}

export default ValidationError;
