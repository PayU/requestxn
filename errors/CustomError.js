module.exports = class CustomError extends Error {
    constructor (response) {
        if (response.statusCode) {
            // handle case simple: false
            const {statusCode, body} = response;
            const message = `${statusCode} - "${stringfyBody(body)}"`;
            // Calling parent constructor of base Error class.
            super(message);
        } else {
            // handle case simple: true
            // Calling parent constructor of base Error class.
            super(response);
        }

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