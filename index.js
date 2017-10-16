let rp = require('request-promise-native');
var reqtry = require('./src/reqtry');
var configuration = require('./src/configuration');

module.exports.defaults = function (options) {
    configuration.defaults(options);
    return module.exports;
};

module.exports.get = function () {
    return reqtry(rp.get, ...arguments);
};
module.exports.post = function () {
    return reqtry(rp.post, ...arguments);
};
module.exports.delete = function () {
    return reqtry(rp.delete, ...arguments);
};
module.exports.put = function () {
    return reqtry(rp.put, ...arguments);
};
module.exports.patch = function () {
    return reqtry(rp.patch, ...arguments);
};
module.exports.head = function () {
    return reqtry(rp.head, ...arguments);
};
module.exports.options = function () {
    return reqtry(rp.options, ...arguments);
};