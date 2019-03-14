const CustomError = require('./CustomError');

module.exports = class RequestError extends CustomError {
    constructor (response) {
        super(response);

        // Saving class name in the property of our custom error as a shortcut.
        this.name = this.constructor.name;

        // Capturing stack trace, excluding constructor call from it.
        Error.captureStackTrace(this, this.constructor);
    }
};