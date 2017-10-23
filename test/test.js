var request = require('../index');
var rp = require('request-promise-native');
var StatusCodeError = require('../src/StatusCodeError');
var RetryError = require('../src/RetryError');
var sinon = require('sinon');
var should = require('should');
var Http = require('http');
var Promise = require('bluebird');

describe('When sending get request with defaults', function () {
    var sandbox;
    var stub;
    before(function () {
        sandbox = sinon.sandbox.create();
        stub = sandbox.stub(rp, 'get');
    });
    after(function () {
        stub.restore();
    });
    afterEach(function () {
        sandbox.resetHistory();
    });
    it('Should return 200 OK response after 1 try', function () {
        var response = {
            statusCode: 200,
            body: 'body'
        };
        stub.resolves(response);
        return request.get('www.google.com').should.be.fulfilledWith(response)
            .then(() => {
                should(stub.callCount).eql(1);
            });
    });
    it('Should return 500 response after 1 try', function () {
        var response = {
            statusCode: 500,
            body: 'body'
        };
        stub.resolves(response);
        return request.get('www.google.com').should.be.fulfilledWith(response)
            .then(() => {
                should(stub.callCount).eql(1);
            });
    });
    it('Should return an error after 1 try', function () {
        var response = {
            statusCode: 500,
            body: 'body'
        };
        stub.rejects(response);
        return request.get('www.google.com').should.be.rejectedWith(response)
            .then((response) => {
                should(stub.callCount).eql(1);
            });
    });
});
describe('When sending get request with max value set', function () {
    var retry = {max: 3};
    var sandbox;
    var stub;
    before(function () {
        sandbox = sinon.sandbox.create();
        stub = sandbox.stub(rp, 'get');
    });
    after(function () {
        stub.restore();
    });
    afterEach(function () {
        sandbox.resetHistory();
    });
    it('Should return 200 OK response 1 try', function () {
        var response = {
            statusCode: 200,
            body: 'body'
        };
        stub.resolves(response);
        return request.get('www.google.com', {retry: retry}).should.be.fulfilledWith(response)
            .then(() => {
                should(stub.callCount).eql(1);
            });
    });
    it('Should return 500 response after 1 try', function () {
        var response = {
            statusCode: 500,
            body: 'body'
        };
        stub.resolves(response);
        return request.get('www.google.com', {retry: retry}).should.be.resolvedWith(response)
            .then((response) => {
                should(stub.callCount).eql(1);
            });
    });
    it('Should return an error after 3 tries', function () {
        var response = {
            statusCode: 500,
            body: 'body'
        };
        stub.rejects(response);
        return request.get('www.google.com', {retry: retry}).should.be.rejectedWith(response)
            .then((response) => {
                should(stub.callCount).eql(3);
            });
    });
});

describe('When sending request with the default max value and retryOn5xx set to true', function () {
    var retry = {retryOn5xx: true};
    var sandbox;
    var stub;
    before(function () {
        sandbox = sinon.sandbox.create();
        stub = sandbox.stub(rp, 'get');
    });
    after(function () {
        stub.restore();
    });
    afterEach(function () {
        sandbox.resetHistory();
    });
    it('Should return 200 OK response 1 try', function () {
        var response = {
            statusCode: 200,
            body: 'body'
        };
        stub.resolves(response);
        return request.get('www.google.com', {retry: retry}).should.be.fulfilledWith(response)
            .then(() => {
                should(stub.callCount).eql(1);
            });
    });
    it('Should return 500 response after 1 tries', function () {
        var response = {
            statusCode: 500,
            body: 'body'
        };
        stub.resolves(response);
        return request.get('www.google.com', {retry: retry}).should.be.rejectedWith(new StatusCodeError(response))
            .then((response) => {
                should(stub.callCount).eql(1);
            });
    });
});

describe('When sending get request with max value set and retryOn5xx set to true', function () {
    var retry = {max: 3, retryOn5xx: true};
    var sandbox;
    var stub;
    before(function () {
        sandbox = sinon.sandbox.create();
        stub = sandbox.stub(rp, 'get');
    });
    after(function () {
        stub.restore();
    });
    afterEach(function () {
        sandbox.resetHistory();
    });
    it('Should return 200 OK response 1 try', function () {
        var response = {
            statusCode: 200,
            body: 'body'
        };
        stub.resolves(response);
        return request.get('www.google.com', {retry: retry}).should.be.fulfilledWith(response)
            .then(() => {
                should(stub.callCount).eql(1);
            });
    });
    it('Should return 500 response after 3 tries', function () {
        var response = {
            statusCode: 500,
            body: 'body'
        };
        stub.resolves(response);
        return request.get('www.google.com', {retry: retry}).should.be.rejectedWith(new StatusCodeError(response))
            .then((response) => {
                should(stub.callCount).eql(3);
            });
    });
    it('Should return oan error on rejection (network error) after 3 tries', function () {
        var error = new Error('getaddrinfo ENOTFOUND');
        stub.rejects(error);
        return request.get('www.google.com', {retry: retry}).should.be.rejectedWith(error)
            .then((response) => {
                should(stub.callCount).eql(3);
            });
    });
});

describe('When sending get request with max value set and retryStrategyFn given', function () {
    var sandbox;
    var stub;
    var fn = function (response) {
        return response.statusCode === 500;
    };
    var retry = {max: 3, retryStrategyFn: fn};
    before(function () {
        sandbox = sinon.sandbox.create();
        stub = sandbox.stub(rp, 'get');
    });
    after(function () {
        stub.restore();
    });
    afterEach(function () {
        sandbox.resetHistory();
    });
    it('Should return 200 OK response 1 try', function () {
        var response = {
            statusCode: 200,
            body: 'body'
        };
        stub.resolves(response);
        return request.get('www.google.com', {retry: retry}).should.be.fulfilledWith(response)
            .then(() => {
                should(stub.callCount).eql(1);
            });
    });
    it('Should return 500 response after 3 tries', function () {
        var response = {
            statusCode: 500,
            body: 'body'
        };
        stub.resolves(response);
        return request.get('www.google.com', {retry: retry}).should.be.rejectedWith(new RetryError(response))
            .then((response) => {
                should(stub.callCount).eql(3);
            });
    });
});

describe('When sending request with successFn and errorFn', function () {
    var sandbox;
    var stub;
    var successFn;
    var errorFn;
    var retry;
    before(function () {
        sandbox = sinon.sandbox.create();
        stub = sandbox.stub(rp, 'get');
        successFn = sandbox.stub();
        errorFn = sandbox.stub();
        retry = {max: 3, successFn: successFn, errorFn: errorFn, retryOn5xx: true};
    });
    after(function () {
        stub.restore();
    });
    afterEach(function () {
        sandbox.resetHistory();
    });
    it('Should return 200 OK response 1 try', function () {
        var response = {
            statusCode: 200,
            body: 'body'
        };
        stub.resolves(response);
        return request.get('www.google.com', {retry: retry}).should.be.fulfilledWith(response)
            .then(() => {
                should(stub.callCount).eql(1);
                should(successFn.callCount).eql(1);
                should(errorFn.callCount).eql(0);
            });
    });
    it('Should reject 500 response after 3 tries', function () {
        var response = {
            statusCode: 500,
            body: 'body'
        };
        stub.resolves(response);
        return request.get('www.google.com', {retry: retry}).should.be.rejectedWith(new StatusCodeError(response))
            .then((response) => {
                should(stub.callCount).eql(3);
                should(successFn.callCount).eql(0);
                should(errorFn.callCount).eql(3);
            });
    });
    it('Should return 200 response after 3 tries', function () {
        var successRes = {
            statusCode: 200,
            body: 'success'
        };
        var failRes = {
            statusCode: 500,
            body: 'fail'
        };
        stub.resolves(failRes);
        stub.onCall(2).resolves(successRes);
        return request.get('www.google.com', {retry: retry})
            .then((response) => {
                should(response.statusCode).eql(200);
                should(response.body).eql('success');
                should(response.errorCount).eql(2);
                should(stub.callCount).eql(3);
                should(successFn.callCount).eql(1);
                should(errorFn.callCount).eql(2);
            });
    });
});