'use strict';

// class StatusCodeError extends Error {
//     constructor (response) {
//         super();
//         Error.captureStackTrace(this, this.constructor);
//         this.name = this.constructor.name;
//         var body = response.body && typeof response.body.toString === 'function' ? response.body.toString().replace(/\n/g, '\\n') : response.body;
//         this.message = `${response.statusCode} - "${body}"`;
//     }
// }

// module.exports = StatusCodeError;

module.exports = class StatusCodeError extends Error {
    constructor (response, status) {
        // Calling parent constructor of base Error class.
        let statusCode = response.statusCode;
        let body = response.body && typeof response.body.toString === 'function' ? response.body.toString().replace(/\n/g, '\\n') : response.body;
        let message = `${statusCode} - "${body}"`;
        super(message);

        // Saving class name in the property of our custom error as a shortcut.
        this.name = this.constructor.name;

        // Capturing stack trace, excluding constructor call from it.
        Error.captureStackTrace(this, this.constructor);
    }
};