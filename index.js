const rp = require('request-promise-native');
const retry = require('./retry');
const StatusCodeError = require('./errors/StatusCodeError');
const RequestError = require('./errors/RequestError');
const defaults = require('lodash.defaults');

const FUNCTIONS = ['retryStrategy', 'onSuccess', 'onError'];

const requester = decorateMethod('get');
requester.get = decorateMethod('get');
requester.head = decorateMethod('head');
requester.options = decorateMethod('options');
requester.post = decorateMethod('post');
requester.put = decorateMethod('put');
requester.patch = decorateMethod('patch');
requester.del = decorateMethod('delete');
requester['delete'] = decorateMethod('delete');
requester.jar = rp.jar;
requester.cookie = rp.cookie;
requester.forever = rp.forever;

requester.defaults = (defaultOptions) => {
    const requester = decorateMethod('get', defaultOptions);
    requester.get = decorateMethod('get', defaultOptions);
    requester.head = decorateMethod('head', defaultOptions);
    requester.options = decorateMethod('options', defaultOptions);
    requester.post = decorateMethod('post', defaultOptions);
    requester.put = decorateMethod('put', defaultOptions);
    requester.patch = decorateMethod('patch', defaultOptions);
    requester.del = decorateMethod('delete', defaultOptions);
    requester['delete'] = decorateMethod('delete', defaultOptions);
    requester.jar = rp.jar;
    requester.cookie = rp.cookie;
    requester.forever = rp.forever;
    return requester;
};

module.exports = requester;

function decorateMethod(method, defaultsOptions = {max: 1}) {
    return (uri, options) => {
        const $options = buildOptions(uri, options, defaultsOptions);
        const {max, backoffBase, backoffExponent} = $options;

        try {
            validateInput($options);
        } catch (error) {
            return Promise.reject(error);
        }

        let attempts = 0;

        return retry(() => {
            attempts++;
            return rp[method]($options)
                .then(response => handleResponse($options, response, attempts))
                .catch(error => handleError($options, error, attempts));
        }, {max, backoffBase, backoffExponent})
            .then(response => buildResponse($options, response, attempts));
    };
}

function buildOptions(uri, options = {}, defaultOptions) {
    if (typeof uri === 'object') {
        const newOptions = defaults(uri, defaultOptions);
        return buildRequestOptions(newOptions);
    } else {
        const newOptions = defaults({uri}, options, defaultOptions);
        return buildRequestOptions(newOptions);
    }
}

function validateInput(options) {
    FUNCTIONS.forEach((fn) => {
        if (options[fn] && typeof options[fn] !== 'function') {
            throw new Error(`${fn} must be a function`);
        }
    });
}

function buildRequestOptions(options) {
    options.originalSimpleValue = options.simple;
    options.originalResolveWithFullResponse = options.resolveWithFullResponse;
    options.simple = false;
    options.resolveWithFullResponse = true;

    return options;
}

function handleResponse(options, response, attempts) {
    const {retryOn5xx, retryStrategy, originalSimpleValue} = options;
    const {statusCode} = response;

    if (retryOn5xx === true && response.statusCode >= 500) {
        throw new StatusCodeError(response);
    } else if (retryStrategy && retryStrategy(response)) {
        const error = isStatusCodeFailure(originalSimpleValue, statusCode)
            ? new StatusCodeError(response)
            : new RequestError(response);
        throw error;
    }
    return response;
}

function handleError(options, error, attempts) {
    const {onError} = options;

    if (onError) {
        onError(options, error, attempts);
    }

    throw error;
}

function buildResponse(options, response, attempts) {
    const {onSuccess, onError, originalSimpleValue, originalResolveWithFullResponse} = options;
    const {statusCode} = response;

    if (isStatusCodeFailure(originalSimpleValue, statusCode)) {
        const error = new StatusCodeError(response);
        onError && onError(options, error, attempts);
        throw error;
    } else {
        onSuccess && onSuccess(options, response, attempts);
    }

    if (originalResolveWithFullResponse === true) {
        response.attempts = attempts;
        return response;
    } else {
        return response.body;
    }
}

function isStatusCodeFailure(simple, statusCode) {
    return statusCode >= 300 && (simple === true || simple === undefined);
}