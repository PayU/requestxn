const rp = require('request-promise-native');
const retry = require('retry-as-promised');
const StatusCodeError = require('./errors/StatusCodeError');
const RetryError = require('./errors/RetryError');
const defaults = require('lodash.defaults');

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

        ['retryStrategyFn', 'onSuccess', 'onError'].forEach((fn) => {
            if ($options[fn] && typeof $options[fn] !== 'function') {
                throw new Error(`${fn} must be a function`);
            }
        });

        let errorCount = 0;

        return retry(() => {
            return rp[method]($options)
                .then((response) => handleResponse($options, response, errorCount))
                .catch((error) => handleError($options, error, ++errorCount));
        }, $options)
            .then((response) => buildResponse(response, errorCount));
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

function buildRequestOptions(options) {
    options.$simple = options.simple;
    options.simple = false;
    options.resolveWithFullResponse = true;

    return options;
}

function handleResponse(options, response, errorCount) {
    const {retryOn5xx, retryStrategy, onSuccess, simple, $simple} = options;

    if (retryOn5xx === true && response.statusCode >= 500) {
        throw new StatusCodeError(response);
    } else if (retryStrategy && retryStrategy(response)) {
        throw new RetryError(response);
    } else if (($simple === true || simple === true) && response.statusCode >= 300) {
        throw new StatusCodeError(response);
    } else if (onSuccess) {
        onSuccess(options, response, errorCount);
    }
    return response;
}

function handleError(options, error, errorCount) {
    const {onError} = options;

    if (onError) {
        onError(options, error, errorCount);
    }

    throw error;
}

function buildResponse(response, errorCount) {
    if (typeof response === 'object') {
        response.errorCount = errorCount;
        return response;
    } else {
        return response;
    }
}