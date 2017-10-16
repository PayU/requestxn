'use strict';

let rp = require('request-promise-native');
let retry = require('retry-as-promised');
let isObject = require('lodash').isObject;
let defaults = require('lodash').defaults;
let cloneDeep = require('lodash').cloneDeep;
let StatusCodeError = require('./StatusCodeError');

let retryDefaults = {
};

let requestDefaults = {
};

module.exports.defaults = function ({request, retry}) {
    if (isObject(request)) {
        requestDefaults = cloneDeep(request);
        rp.defaults(request);
    }
    if (isObject(retry)) {
        retryDefaults = cloneDeep(retry);
    }
    return module.exports;
};

module.exports.get = function () {
    return sendRequest(rp.get, ...arguments);
};
module.exports.post = function () {
    return sendRequest(rp.post, ...arguments);
};
module.exports.delete = function () {
    return sendRequest(rp.delete, ...arguments);
};
module.exports.put = function () {
    return sendRequest(rp.put, ...arguments);
};
module.exports.patch = function () {
    return sendRequest(rp.patch, ...arguments);
};
module.exports.head = function () {
    return sendRequest(rp.head, ...arguments);
};
module.exports.options = function () {
    return sendRequest(rp.options, ...arguments);
};

function sendRequest(request, uri, options) {
    let errors = [];
    let retryOptions = getRetryOptions(uri, options);
    let originalRequestConfig = getOriginalRequestConfig(uri, options);
    let requestOptions = getRequestOptions(uri, options);
    if (retryOptions.retry5xx === true) {
        requestOptions.simple = false;
        requestOptions.resolveWithFullResponse = true;
    }
    return retry(() => {
        return request(uri, options)
            .then((response) => {
                return handleResponse(response, retryOptions);
            })
            .catch((error) => {
                errors.push(error);
                throw error;
            });
    }, retryOptions)
        .then((response) => buildResponse(originalRequestConfig, response, errors))
        .catch((error) => {
            error.retries = errors.length;
            error.errors = errors;
            throw error;
        });
};

function handleResponse(response, retryOptions) {
    let {retry5xx, retryStrategyFn} = retryOptions;
    if (retry5xx && response.statusCode >= 400) {
        throw new StatusCodeError(response);
    } else if (retryStrategyFn && retryStrategyFn(response)) {
        throw new StatusCodeError(response);
    } else {
        return response;
    }
}

function buildResponse(originalRequestConfig, response, errors) {
    response.errors = errors;
    response.retries = response.errors.length;
    if (originalRequestConfig.simple === undefined || (originalRequestConfig.simple && response.statusCode >= 400)) {
        throw new StatusCodeError(response);
    } else if (originalRequestConfig.resolveWithFullResponse) {
        return response;
    } else {
        return response.body;
    }
}

function getRequestOptions(args) {
    if (args.length === 1 && isObject(args[0])) {
        return args[0];
    } else if (args.length > 1 && isObject(args[1])) {
        return args[1];
    } else {
        return {};
    }
}

function getRetryOptions(args) {
    let retryOptions = getRequestOptions(args).retry;
    return defaults(retryOptions, retryDefaults);
}

function getOriginalRequestConfig(args) {
    let requestOptions = getRequestOptions(args);
    return {
        simple: requestOptions.simple !== undefined ? requestOptions.simple : requestDefaults.simple,
        resolveWithFullResponse: requestOptions.resolveWithFullResponse !== undefined ? requestOptions.resolveWithFullResponse : requestDefaults.resolveWithFullResponse
    };
}