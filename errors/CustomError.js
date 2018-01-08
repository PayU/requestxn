module.exports = class CustomError extends Error {
    constructor (response) {
        // handle case simple: false
        const {statusCode, body} = response;
        const message = `${statusCode} - "${stringifyBody(body)}"`;
        // Calling parent constructor of base Error class.
        super(message);

        this.response = response;

        // Saving class name in the property of our custom error as a shortcut.
        this.name = this.constructor.name;
    }
};

function stringifyBody(body) {
    if (typeof body === 'object') {
        return JSON.stringify(body).replace(/\n/g, '\\n');
    } else if (typeof body === 'string') {
        return body.replace(/\n/g, '\\n');
    } else if (body) {
        return body;
    } else {
        return '';
    }
}