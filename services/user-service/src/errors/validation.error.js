import CustomError from "./custom.error.js";

class ValidationError extends CustomError {
  constructor(message = "Validation error!") {
    super(message, 400);
  }
}

export default ValidationError;
