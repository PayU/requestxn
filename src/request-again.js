'use strict';

let retry = require('retry-as-promised');
let map = require('lodash').map;
let StatusCodeError = require('./StatusCodeError');
let CustomError = require('./CustomError');
let defaults = require('lodash').defaults;
let isObject = require('lodash').isObject;

/**
 * Send request-again request
 *
 * @param {object} request the request-promise instance to use
 * @param {string} method the method to send
 * @param {any} uri the url to send the request to or options
 * @param {object} options
 * @returns
 */
module.exports = function requestAgain(request, method, uri, options) {
    let [_uri, _options, retryOptions] = buildOptions(uri, options, request.retryDefaults);

    let errors = [];
    return retry(() => {
        return request[method](_uri, _options)
            .then((response) => handleResponse(retryOptions, response))
            .catch((error) => handleError(retryOptions, error, errors));
    }, retryOptions)
        .then((response) => buildResponse(response, errors))
        .catch((error) => { throw buildErrorResponse(error, errors) });
};

/**
 *
 *
 * @param {string} url
 * @param {object} options
 * @param {object} retryDefaults
 * @returns
 */
function buildOptions(url, options, retryDefaults) {
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

/**
 *
 *
 * @param {object} requestOptions
 * @param {object} retryOptions
 */
function buildRequestOptions(requestOptions, retryOptions) {
    if (retryOptions.retryOn5xx === true || typeof retryOptions.retryStrategyFn === 'function') {
        requestOptions.simple = false;
        requestOptions.resolveWithFullResponse = true;
    }
}

/**
 *
 *
 * @param {object} retryOptions
 * @param {object} response
 * @returns
 */
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

/**
 *
 *
 * @param {object} retryOptions
 * @param {Error} error
 * @param {array} errors
 */
function handleError(retryOptions, error, errors) {
    errors.push(error);
    if (retryOptions.logFn) {
        retryOptions.logFn(error, errors.length);
    }
    throw error;
}

/**
 *
 *
 * @param {object} response
 * @param {array} errors
 * @returns
 */
function buildResponse(response, errors) {
    if (isObject(response)) {
        response.errors = map(errors, (error) => error.message);
        response.retries = response.errors.length;
        return response.body;
    } else {
        return response;
    }
}

/**
 *
 *
 * @param {Error} error
 * @param {array} errors
 * @returns
 */
function buildErrorResponse(error, errors) {
    error.retries = errors.length;
    return error;
}