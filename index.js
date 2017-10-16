let rp = require('request-promise-native');
var rq = require('./src/retquest');
var configuration = require('./src/configuration');

module.exports.defaults = function (options) {
    configuration.defaults(options);
    return module.exports;
};

module.exports.get = function () {
    return rq(rp.get, ...arguments);
};
module.exports.post = function () {
    return rq(rp.post, ...arguments);
};
module.exports.delete = function () {
    return rq(rp.delete, ...arguments);
};
module.exports.put = function () {
    return rq(rp.put, ...arguments);
};
module.exports.patch = function () {
    return rq(rp.patch, ...arguments);
};
module.exports.head = function () {
    return rq(rp.head, ...arguments);
};
module.exports.options = function () {
    return rq(rp.options, ...arguments);
};