'use strict';

let rp = require('request-promise-native');
var ra = require('./src/request-again');

module.exports = getImplementations(rp);
module.exports.defaults = function (options) {
    var rpInstance = rp.defaults(options);
    rpInstance.retryDefaults = options && options.retry;
    return getImplementations(rpInstance);
};

function getImplementations(rp) {
    return {
        get: function get() {
            return ra(rp, 'get', ...arguments);
        },
        post: function post() {
            return ra(rp, 'post', ...arguments);
        },
        delete: function delete_() {
            return ra(rp, 'delete', ...arguments);
        },
        put: function put() {
            return ra(rp, 'put', ...arguments);
        },
        patch: function patch() {
            return ra(rp, 'patch', ...arguments);
        },
        head: function head() {
            return ra(rp, 'head', ...arguments);
        },
        options: function options() {
            return ra(rp, 'options', ...arguments);
        },
        del: function del() {
            return ra(rp, 'del', ...arguments);
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