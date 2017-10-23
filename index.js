'use strict';

let rp = require('request-promise-native');
var request = require('./src/request-repeat');

module.exports = getImplementations(rp);
module.exports.defaults = function (options) {
    var rpInstance = rp.defaults(options);
    rpInstance.retryDefaults = options && options.retry;
    return getImplementations(rpInstance);
};

function getImplementations(rp) {
    return {
        get: function get() {
            return request(rp, 'get', ...arguments);
        },
        post: function post() {
            return request(rp, 'post', ...arguments);
        },
        delete: function delete_() {
            return request(rp, 'delete', ...arguments);
        },
        put: function put() {
            return request(rp, 'put', ...arguments);
        },
        patch: function patch() {
            return request(rp, 'patch', ...arguments);
        },
        head: function head() {
            return request(rp, 'head', ...arguments);
        },
        options: function options() {
            return request(rp, 'options', ...arguments);
        },
        del: function del() {
            return request(rp, 'del', ...arguments);
        },
        forever: function forever() {
            return rp.forever(...arguments);
        },
        cookie: function cookie() {
            return rp.cookie(...arguments);
        },
        jar: function jar() {
            return rp.jar(...arguments);
        },
        initParams: function initParams() {
            return rp.initParams(...arguments);
        }
    };
}