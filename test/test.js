const rp = require('request-promise-native');
const StatusCodeError = require('../errors/StatusCodeError');
const RetryError = require('../errors/RetryError');
const sinon = require('sinon');
const should = require('should');

describe('When sending get request with default values', function () {
    const sandbox = sinon.sandbox.create();
    let stub;
    let request;
    before(function () {
        stub = sandbox.stub(rp, 'get');
        request = require('../index');
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
        return request.get('www.google.com').should.be.rejectedWith(new StatusCodeError(response))
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
    var request;
    before(function () {
        sandbox = sinon.sandbox.create();
        stub = sandbox.stub(rp, 'get');
        request = require('../index');
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
        return request.get('www.google.com', retry).should.be.fulfilledWith(response)
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
        return request.get('www.google.com', retry).should.be.rejectedWith(new StatusCodeError(response))
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
        return request.get('www.google.com', retry).should.be.rejectedWith(response)
            .then((response) => {
                should(stub.callCount).eql(3);
            });
    });
});

describe('When sending request with the default max value and retryOn5xx set to true', function () {
    const retry = {retryOn5xx: true};
    const sandbox = sinon.sandbox.create();
    let stub;
    let request;

    before(function () {
        stub = sandbox.stub(rp, 'get');
        request = require('../index');
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
        return request.get('www.google.com', retry).should.be.fulfilledWith(response)
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
        return request.get('www.google.com', retry).should.be.rejectedWith(new StatusCodeError(response))
            .then((response) => {
                should(stub.callCount).eql(1);
            });
    });
});

describe('When sending request with the default max value and retryOn5xx set to true', function () {
    const retry = {retryOn5xx: true, simple: false};
    const sandbox = sinon.sandbox.create();
    let stub;
    let request;

    before(function () {
        stub = sandbox.stub(rp, 'get');
        request = require('../index');
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
        return request.get('www.google.com', retry).should.be.fulfilledWith(response)
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
        return request.get('www.google.com', retry).should.be.rejectedWith(new StatusCodeError(response))
            .then((response) => {
                should(stub.callCount).eql(1);
            });
    });
    it('Should return 401 response after 1 try', function () {
        var response = {
            statusCode: 401,
            body: 'body'
        };
        stub.resolves(response);
        return request.get('www.google.com', retry).should.be.fulfilledWith(response)
            .then((response) => {
                should(stub.callCount).eql(1);
            });
    });
});

describe('When sending get request with max value set to 3 and retryOn5xx set to true', function () {
    const retry = {max: 3, retryOn5xx: true};
    const sandbox = sinon.sandbox.create();
    let stub;
    let request;
    before(function () {
        stub = sandbox.stub(rp, 'get');
        request = require('../index');
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
        return request.get('www.google.com', retry).should.be.fulfilledWith(response)
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
        return request.get('www.google.com', retry).should.be.rejectedWith(new StatusCodeError(response))
            .then((response) => {
                should(stub.callCount).eql(3);
            });
    });
    it('Should return 401 response after 1 try', function () {
        var response = {
            statusCode: 401,
            body: 'body'
        };
        stub.resolves(response);
        return request.get('www.google.com', retry).should.be.rejectedWith(new StatusCodeError(response))
            .then((response) => {
                should(stub.callCount).eql(1);
            });
    });
    it('Should return oan error on rejection (network error) after 3 tries', function () {
        var error = new Error('getaddrinfo ENOTFOUND');
        stub.rejects(error);
        return request.get('www.google.com', retry).should.be.rejectedWith(error)
            .then((response) => {
                should(stub.callCount).eql(3);
            });
    });
});

describe('When sending get request with max value set and retryStrategy given', function () {
    const fn = function (response) {
        return response.statusCode === 401;
    };
    const sandbox = sinon.sandbox.create();
    const retry = {max: 3, retryStrategy: fn};
    let request;
    let stub;

    before(function () {
        stub = sandbox.stub(rp, 'get');
        request = require('../index');
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
        return request.get('www.google.com', retry).should.be.fulfilledWith(response)
            .then(() => {
                should(stub.callCount).eql(1);
            });
    });
    it('Should return 401 response after 3 tries', function () {
        var response = {
            statusCode: 401,
            body: 'body'
        };
        stub.resolves(response);
        return request.get('www.google.com', retry).should.be.rejectedWith(new RetryError(response))
            .then((response) => {
                should(stub.callCount).eql(3);
            });
    });
});

describe('When sending request with onSuccess and onError', function () {
    const sandbox = sinon.sandbox.create();
    const onSuccess = sandbox.stub();
    const onError = sandbox.stub();
    const retry = {max: 3, retryOn5xx: true, onSuccess, onError};
    let request;
    let stub;

    before(function () {
        stub = sandbox.stub(rp, 'get');
        request = require('../index');
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
        return request.get('www.google.com', retry).should.be.fulfilledWith(response)
            .then(() => {
                should(stub.callCount).eql(1);
                should(onSuccess.callCount).eql(1);
                should(onError.callCount).eql(0);
            });
    });
    it('Should reject 500 response after 3 tries', function () {
        var response = {
            statusCode: 500,
            body: 'body'
        };
        stub.resolves(response);
        return request.get('www.google.com', retry).should.be.rejectedWith(new StatusCodeError(response))
            .then((response) => {
                should(stub.callCount).eql(3);
                should(onSuccess.callCount).eql(0);
                should(onError.callCount).eql(3);
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
        return request.get('www.google.com', retry)
            .then((response) => {
                should(response.statusCode).eql(200);
                should(response.body).eql('success');
                should(response.errorCount).eql(2);
                should(stub.callCount).eql(3);
                should(onSuccess.callCount).eql(1);
                should(onError.callCount).eql(2);
            });
    });
});