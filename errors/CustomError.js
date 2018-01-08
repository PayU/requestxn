module.exports = class CustomError extends Error {
    constructor (response) {
        // handle case simple: false
        const {statusCode, body} = response;
        const message = `${statusCode} - "${stringfyBody(body)}"`;
        // Calling parent constructor of base Error class.
        super(message);

        this.response = response;

        // Saving class name in the property of our custom error as a shortcut.
        this.name = this.constructor.name;
    }
};

function stringfyBody(body) {
    let strigifiedBody;
    if (typeof body === 'object') {
        strigifiedBody = JSON.stringify(body);
    } else {
        strigifiedBody = body;
    }
    return strigifiedBody.replace(/\n/g, '\\n');
}