const rp = require('request-promise-native');
const retry = require('./retry');
const StatusCodeError = require('./errors/StatusCodeError');
const RequestError = require('./errors/RequestError');

const FUNCTIONS = ['retryStrategy', 'onSuccess', 'onError'];

const requester = decorateMethod();
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

function defaults(defaultOptions) {
    const requester = decorateMethod(undefined, defaultOptions);
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
    requester.defaults = (newDefaultOptions) => {
        return defaults(Object.assign({}, defaultOptions, newDefaultOptions));
    };
    return requester;
}

requester.defaults = defaults;

module.exports = requester;

function decorateMethod(method, defaultsOptions) {
    return (uri, options) => {
        const $options = buildOptions(uri, method, options, defaultsOptions);
        const { max, backoffBase, backoffExponent } = $options;

        try {
            validateInput($options);
        } catch (error) {
            return Promise.reject(error);
        }

        let attempts = 0;

        return retry(() => {
            attempts++;
            return rp[$options.method]($options)
                .then(response => handleResponse($options, response, attempts))
                .catch(error => handleError($options, error, attempts));
        }, { max, backoffBase, backoffExponent })
            .then(response => buildResponse($options, response, attempts));
    };
}

function buildOptions(uri, presetMethod, options = {}, defaultOptions = {}) {
    if (typeof uri === 'object') {
        const method = presetMethod || uri.method || 'get';
        const newOptions = Object.assign({ max: 1 }, defaultOptions, uri, { method });
        return buildRequestOptions(newOptions);
    } else {
        const method = presetMethod || 'get';
        const newOptions = Object.assign({ max: 1 }, defaultOptions, options, { method, uri });
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
    options.method = options.method.toLowerCase();

    return options;
}

function handleResponse(options, response, attempts) {
    const { retryOn5xx, retryStrategy, originalSimpleValue, rejectOn5xx, max } = options;
    const { statusCode } = response;

    if (rejectOn5xx !== true && attempts === max) {
        return response;
    } else if (retryOn5xx === true && statusCode >= 500) {
        throw new StatusCodeError(response);
    } else if (retryStrategy && retryStrategy(response)) {
        if (isStatusCodeFailure(originalSimpleValue, statusCode)) {
            throw new StatusCodeError(response);
        } else {
            throw new RequestError(response);
        }
    }
    return response;
}

function handleError(options, error, attempts) {
    const { onError, excludeErrorsFromRetry } = options;

    let errorCode = error.error && error.error.code;
    let excludeError = Array.isArray(excludeErrorsFromRetry) && excludeErrorsFromRetry.includes(errorCode);

    return Promise.resolve()
        .then(() => onError && onError(options, error, attempts))
        .then(() => { return excludeError ? Promise.resolve(error) : Promise.reject(error) });
}

function buildResponse(options, response, attempts) {
    const { onSuccess, onError, originalSimpleValue, originalResolveWithFullResponse } = options;
    const { statusCode } = response;

    if (response instanceof Error) {
        return Promise.reject(response);
    }

    if (isStatusCodeFailure(originalSimpleValue, statusCode)) {
        const error = new StatusCodeError(response);
        return Promise.resolve()
            .then(() => onError && onError(options, error, attempts))
            .then(() => Promise.reject(error));
    }

    return Promise.resolve()
        .then(() => onSuccess && onSuccess(options, response, attempts))
        .then(() => {
            if (originalResolveWithFullResponse === true) {
                response.attempts = attempts;
                return response;
            } else {
                return response.body;
            }
        });
}

function isStatusCodeFailure(simple, statusCode) {
    return statusCode >= 300 && (simple === true || simple === undefined);
}