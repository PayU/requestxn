'use strict';

let rp = require('request-promise-native');
var rr = require('./src/request-repeat');

module.exports = getImplementations(rp);
module.exports.defaults = function (options) {
    var rpInstance = rp.defaults(options);
    rpInstance.retryDefaults = options && options.retry;
    return getImplementations(rpInstance);
};

function getImplementations(rp) {
    return {
        get: function get() {
            return rr(rp, 'get', ...arguments);
        },
        post: function post() {
            return rr(rp, 'post', ...arguments);
        },
        delete: function delete_() {
            return rr(rp, 'delete', ...arguments);
        },
        put: function put() {
            return rr(rp, 'put', ...arguments);
        },
        patch: function patch() {
            return rr(rp, 'patch', ...arguments);
        },
        head: function head() {
            return rr(rp, 'head', ...arguments);
        },
        options: function options() {
            return rr(rp, 'options', ...arguments);
        },
        del: function del() {
            return rr(rp, 'del', ...arguments);
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