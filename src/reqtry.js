'use strict';

let retry = require('retry-as-promised');
let isObject = require('lodash').isObject;
let defaults = require('lodash').defaults;
let get = require('lodash').get;
let StatusCodeError = require('./StatusCodeError');
let configuration = require('./configuration');

module.exports = function sendRequest(request, uri, options) {
    let requestOptions = getRequestOptions(uri, options);
    let retryOptions = getRetryOptions(requestOptions);
    let originalRequestOptions = getOriginalRequestOptions(requestOptions);

    setNewRequestOptions(requestOptions, retryOptions);
    let errors = [];
    return retry(() => {
        return request(uri, options)
            .then((response) => {
                return handleResponse(retryOptions, response);
            })
            .catch((error) => {
                errors.push(error);
                throw error;
            });
    }, retryOptions)
        .then((response) => buildResponse(originalRequestOptions, response, errors))
        .catch((error) => {
            error.retries = errors.length;
            error.errors = errors;
            throw error;
        });
};

function handleResponse(retryOptions, response) {
    let {retry5xx, retryStrategyFn} = retryOptions;

    if (retry5xx && response.statusCode >= 400) {
        throw new StatusCodeError(response);
    } else if (retryStrategyFn && retryStrategyFn(response)) {
        throw new StatusCodeError(response);
    } else {
        return response;
    }
}

function buildResponse(originalRequestOptions, response, errors) {
    response.errors = errors;
    response.retries = response.errors.length;
    if (originalRequestOptions.simple === undefined || (originalRequestOptions.simple && response.statusCode >= 400)) {
        throw new StatusCodeError(response);
    } else if (originalRequestOptions.resolveWithFullResponse) {
        return response;
    } else {
        return response.body;
    }
}

function getRequestOptions(uri, options) {
    if (isObject(options)) {
        return options;
    } else if (isObject(uri)) {
        return uri;
    } else {
        return {};
    }
}

function getRetryOptions(requestOptions) {
    let retryOptions = requestOptions.retry;
    return defaults(retryOptions, configuration.retry);
}

function getOriginalRequestOptions(requestOptions) {
    let simple = get(configuration, 'request.simple');
    let resolveWithFullResponse = get(configuration, 'request.resolveWithFullResponse');

    return {
        simple: requestOptions.simple !== undefined ? requestOptions.simple : simple,
        resolveWithFullResponse: requestOptions.resolveWithFullResponse !== undefined ? requestOptions.resolveWithFullResponse : resolveWithFullResponse
    };
}

function setNewRequestOptions(requestOptions, retryOptions) {
    if (retryOptions.retry5xx === true) {
        requestOptions.simple = false;
        requestOptions.resolveWithFullResponse = true;
    }
}