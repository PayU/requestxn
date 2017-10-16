'use strict';

let rp = require('request-promise-native');
let isObject = require('lodash').isObject;
let cloneDeep = require('lodash').cloneDeep;

module.exports.defaults = function ({request, retry}) {
    if (isObject(request)) {
        module.exports.request = cloneDeep(request);
        rp.defaults(request);
    }
    if (isObject(retry)) {
        module.exports.retry = cloneDeep(retry);
    }
};