'use strict';

let retry = require('retry-as-promised');
let map = require('lodash').map;
let StatusCodeError = require('./StatusCodeError');
let CustomError = require('./CustomError');
let defaults = require('lodash').defaults;
let isObject = require('lodash').isObject;

module.exports = function sendRequest(request, method, uri, options) {
    let [_uri, _options, retryOptions] = getOptions(uri, options, request.retryDefaults);

    let errors = [];
    return retry(() => {
        return request[method](_uri, _options)
            .then((response) => {
                return handleResponse(retryOptions, response);
            })
            .catch((error) => {
                errors.push(error);
                if (retryOptions.logFn) {
                    retryOptions.logFn(retryOptions, error, errors.length);
                }
                throw error;
            });
    }, retryOptions)
        .then((response) => buildResponse(response, errors))
        .catch((error) => { throw buildErrorResponse(error, errors) });
};

function handleResponse(retryOptions, response) {
    let {retryOn5xx, retryStrategyFn} = retryOptions;

    if (retryOn5xx && response.statusCode >= 500) {
        throw new StatusCodeError(response);
    } else if (typeof retryStrategyFn === 'function' && retryStrategyFn(response)) {
        throw new CustomError(response);
    } else {
        return response;
    }
}

function buildResponse(response, errors) {
    if (isObject(response)) {
        response.errors = map(errors, (error) => error.message);
        response.retries = response.errors.length;
        return response.body;
    } else {
        return response;
    }
}

function buildErrorResponse(error, errors) {
    error.retries = errors.length;
    return error;
}

function getOptions(url, options, retryDefaults) {
    let retryOptions;
    if (typeof url === 'string') {
        options = options || {};
        retryOptions = defaults(options.retry, retryDefaults);
        buildRequestOptions(options, retryOptions);
    } else if (typeof url === 'object') {
        retryOptions = defaults(url.retry, retryDefaults);
        buildRequestOptions(url, retryOptions);
    }

    return [url, options, retryOptions];
}

function buildRequestOptions(requestOptions, retryOptions) {
    if (retryOptions.retryOn5xx === true || typeof retryOptions.retryStrategyFn === 'function') {
        requestOptions.simple = false;
        requestOptions.resolveWithFullResponse = true;
    }
}