const rp = require('request-promise-native');
const StatusCodeError = require('../errors/StatusCodeError');
const RequestError = require('../errors/RequestError');
const sinon = require('sinon');
const should = require('should');
const nock = require('nock');

const URI = 'http://www.google.com';
const GOOD_RESPONSE = {
    statusCode: 200,
    body: 'ok body'
};
const STRING_RESPONSE_500 = {
    statusCode: 500,
    body: 'bad bad body'
};
const JSON_RESPONSE_500 = {
    statusCode: 500,
    body: {
        var: 'val'
    }
};

// TODO: Add tests for all methods (Upper and lower cases)
// TODO: Add tests for calling the function directly by passing method in options
describe('Validation checks', function () {
    const sandbox = sinon.createSandbox();
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

    it('Should throw an error when onSuccess is not a function', function () {
        return request.get({ uri: URI, onSuccess: 'string' })
            .should.be.rejectedWith('onSuccess must be a function')
            .then(() => {
                should(stub.callCount).be.eql(0);
            });
    });
    it('Should throw an error when onError is not a function', function () {
        return request.get({ uri: URI, onError: 'string' })
            .should.be.rejectedWith('onError must be a function')
            .then(() => {
                should(stub.callCount).be.eql(0);
            });
    });
    it('Should throw an error when retryStrategy is not a function', function () {
        return request.get({ uri: URI, retryStrategy: 'string' })
            .should.be.rejectedWith('retryStrategy must be a function')
            .then(() => {
                should(stub.callCount).be.eql(0);
            });
    });
});

describe('When calling the exported object directly', function () {
    const sandbox = sinon.createSandbox();
    let getStub;
    let postStub;
    let request;
    before(function () {
        getStub = sandbox.stub(rp, 'get');
        postStub = sandbox.stub(rp, 'post');
        request = require('../index');
    });
    after(function () {
        sandbox.restore();
    });
    afterEach(function () {
        sandbox.resetHistory();
    });
    it('Should send a get request', function () {
        getStub.resolves(GOOD_RESPONSE);
        return request(URI)
            .should.be.fulfilledWith(GOOD_RESPONSE.body)
            .then(() => {
                should(getStub.callCount).be.eql(1);
            });
    });
    it('Should use options.method when exists', function () {
        postStub.resolves(GOOD_RESPONSE);
        return request({ method: 'post', uri: URI })
            .should.be.fulfilledWith(GOOD_RESPONSE.body)
            .then(() => {
                should(postStub.callCount).be.eql(1);
            });
    });
});

describe('When calling a method directly', function () {
    const sandbox = sinon.createSandbox();
    let postStub;
    let request;
    before(function () {
        postStub = sandbox.stub(rp, 'post');
        request = require('../index');
    });
    after(function () {
        sandbox.restore();
    });
    afterEach(function () {
        sandbox.resetHistory();
    });

    describe('And passing options', function () {
        it('Should use the called method', function () {
            postStub.resolves(GOOD_RESPONSE);
            return request.post({ uri: URI })
                .should.be.fulfilledWith(GOOD_RESPONSE.body)
                .then(() => {
                    should(postStub.callCount).be.eql(1);
                });
        });
    });

    describe('And passing another method in options', function () {
        it('Should use the called method', function () {
            postStub.resolves(GOOD_RESPONSE);
            return request.post({ uri: URI, method: 'put' })
                .should.be.fulfilledWith(GOOD_RESPONSE.body)
                .then(() => {
                    should(postStub.callCount).be.eql(1);
                });
        });
    });

    describe('And passing URI without options', function () {
        it('Should use the called method', function () {
            postStub.resolves(GOOD_RESPONSE);
            return request.post(URI)
                .should.be.fulfilledWith(GOOD_RESPONSE.body)
                .then(() => {
                    should(postStub.callCount).be.eql(1);
                });
        });
    });

    describe('And passing URI with options', function () {
        it('Should use the called method', function () {
            postStub.resolves(GOOD_RESPONSE);
            return request.post(URI, { timeout: 1000 })
                .should.be.fulfilledWith(GOOD_RESPONSE.body)
                .then(() => {
                    should(postStub.callCount).be.eql(1);
                });
        });
    });

    describe('And passing URI with another method in options', function () {
        it('Should use the called method', function () {
            postStub.resolves(GOOD_RESPONSE);
            return request.post(URI, { method: 'put' })
                .should.be.fulfilledWith(GOOD_RESPONSE.body)
                .then(() => {
                    should(postStub.callCount).be.eql(1);
                });
        });
    });
});

describe('When calling a method and passing another method in options', function () {
    const sandbox = sinon.createSandbox();
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
    it('Should send a get request', function () {
        stub.resolves(GOOD_RESPONSE);
        return request.get({ uri: URI, method: 'post' })
            .should.be.fulfilledWith(GOOD_RESPONSE.body)
            .then(() => {
                should(stub.callCount).be.eql(1);
            });
    });
});

describe('When sending get request with default values', function () {
    const sandbox = sinon.createSandbox();
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
    it('Should return 200 OK response after 1 attempt', function () {
        stub.resolves(GOOD_RESPONSE);
        return request.get(URI)
            .should.be.fulfilledWith(GOOD_RESPONSE.body)
            .then(() => {
                should(stub.callCount).be.eql(1);
            });
    });
    it('Should return 500 response after 1 attempt', function () {
        stub.resolves(STRING_RESPONSE_500);
        return request.get(URI)
            .should.be.rejectedWith(new StatusCodeError(STRING_RESPONSE_500))
            .then(() => {
                should(stub.callCount).be.eql(1);
            });
    });
    it('Should return an error after 1 attempt', function () {
        const error = new Error('some error');
        stub.rejects(error);
        return request.get(URI)
            .should.be.rejectedWith(error)
            .then((response) => {
                should(stub.callCount).be.eql(1);
            });
    });
});

describe('When sending get request with max value set', function () {
    const options = { max: 3 };
    let sandbox;
    let stub;
    let request;
    before(function () {
        sandbox = sinon.createSandbox();
        stub = sandbox.stub(rp, 'get');
        request = require('../index');
    });
    after(function () {
        stub.restore();
    });
    afterEach(function () {
        sandbox.resetHistory();
    });
    it('Should return 200 OK response 1 attempt', function () {
        stub.resolves(GOOD_RESPONSE);
        return request.get(URI, options)
            .should.be.fulfilledWith(GOOD_RESPONSE.body)
            .then(() => {
                should(stub.callCount).be.eql(1);
            });
    });
    it('Should return 500 response after 1 attempt', function () {
        stub.resolves(STRING_RESPONSE_500);
        return request.get(URI, options)
            .should.be.rejectedWith(new StatusCodeError(STRING_RESPONSE_500))
            .then((response) => {
                should(stub.callCount).be.eql(1);
            });
    });
    it('Should return 500 response after 1 attempt', function () {
        stub.resolves(STRING_RESPONSE_500);
        return request.get(URI, options)
            .should.be.rejectedWith(new StatusCodeError(STRING_RESPONSE_500))
            .then(() => {
                should(stub.callCount).be.eql(1);
            });
    });
    it('Should return an error after 3 attempts', function () {
        const error = new Error('RequestError');
        stub.rejects(error);
        return request.get(URI, options)
            .should.be.rejectedWith(error)
            .then((response) => {
                should(stub.callCount).be.eql(3);
            });
    });
});

describe('When sending request with the default max value and retryOn5xx set to true', function () {
    const options = { retryOn5xx: true };
    const sandbox = sinon.createSandbox();
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
    it('Should return 200 OK response 1 attempt', function () {
        stub.resolves(GOOD_RESPONSE);
        return request.get(URI, options)
            .should.be.fulfilledWith(GOOD_RESPONSE.body)
            .then(() => {
                should(stub.callCount).be.eql(1);
            });
    });
    it('Should return 500 response after 1 attempt', function () {
        stub.resolves(STRING_RESPONSE_500);
        return request.get(URI, options)
            .should.be.rejectedWith(new StatusCodeError(STRING_RESPONSE_500))
            .then((response) => {
                should(stub.callCount).be.eql(1);
            });
    });
});

describe('When sending request with the default max value and retryOn5xx set to true', function () {
    const options = { retryOn5xx: true, simple: false };
    const sandbox = sinon.createSandbox();
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
    it('Should return 200 OK response 1 attempt', function () {
        stub.resolves(GOOD_RESPONSE);
        return request.get(URI, options)
            .should.be.fulfilledWith(GOOD_RESPONSE.body)
            .then(() => {
                should(stub.callCount).be.eql(1);
            });
    });
    it('Should return 500 response after 1 attempt', function () {
        stub.resolves(STRING_RESPONSE_500);
        return request.get(URI, options)
            .should.be.fulfilledWith(STRING_RESPONSE_500.body)
            .then((response) => {
                should(stub.callCount).be.eql(1);
            });
    });
    it('Should return an error after 1 attempt', function () {
        const error = new Error('err');
        stub.rejects(error);
        return request.get(URI, options)
            .should.be.rejectedWith(error)
            .then((response) => {
                should(stub.callCount).be.eql(1);
            });
    });
    it('Should return 401 response after 1 attempt', function () {
        const response = {
            statusCode: 401,
            body: 'body'
        };
        stub.resolves(response);
        return request.get(URI, options)
            .should.be.fulfilledWith(response.body)
            .then((response) => {
                should(stub.callCount).be.eql(1);
            });
    });
});

describe('When sending get request with max value set to 3 and retryOn5xx set to true', function () {
    const options = { max: 3, retryOn5xx: true };
    const sandbox = sinon.createSandbox();
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
    it('Should return 200 OK response 1 attempt', function () {
        stub.resolves(GOOD_RESPONSE);
        return request.get(URI, options)
            .should.be.fulfilledWith(GOOD_RESPONSE.body)
            .then(() => {
                should(stub.callCount).be.eql(1);
            });
    });
    it('Should return 500 response after 3 attempts', function () {
        stub.resolves(STRING_RESPONSE_500);
        return request.get(URI, options)
            .should.be.rejectedWith(new StatusCodeError(STRING_RESPONSE_500))
            .then((response) => {
                should(stub.callCount).be.eql(3);
            });
    });
    it('Should return 401 response after 1 attempt', function () {
        const response = {
            statusCode: 401,
            body: 'body'
        };
        stub.resolves(response);
        return request.get(URI, options)
            .should.be.rejectedWith(new StatusCodeError(response))
            .then((response) => {
                should(stub.callCount).be.eql(1);
            });
    });
    it('Should return an error on rejection (network error) after 3 attempts', function () {
        const error = new Error('getaddrinfo ENOTFOUND');
        stub.rejects(error);
        return request.get(URI, options)
            .should.be.rejectedWith(error)
            .then((response) => {
                should(stub.callCount).be.eql(3);
            });
    });
});

describe('When sending get request with retryOn5xx set to true and simple set to false', function () {
    const options = { max: 3, retryOn5xx: true, simple: false };
    const sandbox = sinon.createSandbox();
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
    it('Should return 200 OK response 1 attempt', function () {
        stub.resolves(GOOD_RESPONSE);
        return request.get(URI, options)
            .should.be.fulfilledWith(GOOD_RESPONSE.body)
            .then(() => {
                should(stub.callCount).be.eql(1);
            });
    });
    it('Should return 500 response body after 3 attempts', function () {
        stub.resolves(STRING_RESPONSE_500);
        return request.get(URI, options)
            .should.be.fulfilledWith(STRING_RESPONSE_500.body)
            .then((response) => {
                should(stub.callCount).be.eql(3);
            });
    });
    it('Should return 401 response after 1 attempt', function () {
        const response = {
            statusCode: 401,
            body: 'body'
        };
        stub.resolves(response);
        return request.get(URI, options)
            .should.be.fulfilledWith(response.body)
            .then((response) => {
                should(stub.callCount).be.eql(1);
            });
    });
    it('Should return an error on rejection (network error) after 3 attempts', function () {
        const error = new Error('getaddrinfo ENOTFOUND');
        stub.rejects(error);
        return request.get(URI, options)
            .should.be.rejectedWith(error)
            .then((response) => {
                should(stub.callCount).be.eql(3);
            });
    });
});

describe('When setting resolveWithFullResponse=false', function () {
    const sandbox = sinon.createSandbox();
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
    it('Should return only the body for 200 OK', function () {
        const options = { resolveWithFullResponse: false };

        stub.resolves(GOOD_RESPONSE);
        return request.get(URI, options)
            .should.be.fulfilledWith(GOOD_RESPONSE.body)
            .then(() => {
                should(stub.callCount).be.eql(1);
            });
    });
    it('Should return only the body for 500 OK', function () {
        const options = { simple: false, resolveWithFullResponse: false };

        stub.resolves(STRING_RESPONSE_500);
        return request.get(URI, options)
            .should.be.fulfilledWith(STRING_RESPONSE_500.body)
            .then((response) => {
                should(stub.callCount).be.eql(1);
            });
    });
    it('Should return 500 response body when retryOn5xx=true', function () {
        const options = { max: 3, retryOn5xx: true, simple: false, resolveWithFullResponse: false };

        const response = {
            statusCode: 500,
            body: 'body'
        };
        stub.resolves(response);
        return request.get(URI, options)
            .should.be.fulfilledWith(response.body)
            .then((response) => {
                should(stub.callCount).be.eql(3);
            });
    });
});

describe('When setting resolveWithFullResponse=true', function () {
    const sandbox = sinon.createSandbox();
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
    it('Should return only the body for 200 OK', function () {
        const options = { resolveWithFullResponse: true };

        stub.resolves(GOOD_RESPONSE);
        return request.get(URI, options)
            .should.be.fulfilledWith(GOOD_RESPONSE)
            .then(() => {
                should(stub.callCount).be.eql(1);
            });
    });
    it('Should return only the body for 500 OK', function () {
        const options = { simple: false, resolveWithFullResponse: true };

        stub.resolves(STRING_RESPONSE_500);
        return request.get(URI, options)
            .should.be.fulfilledWith(STRING_RESPONSE_500)
            .then((response) => {
                should(stub.callCount).be.eql(1);
            });
    });
    it('Should return 500 after 3 attempts when retryOn5xx=true', function () {
        const options = { max: 3, retryOn5xx: true, simple: false, resolveWithFullResponse: true };

        stub.resolves(STRING_RESPONSE_500);
        return request.get(URI, options)
            .should.be.fulfilledWith(STRING_RESPONSE_500)
            .then((response) => {
                should(stub.callCount).be.eql(3);
            });
    });
});

describe('When passing all options as the first argument', function () {
    const sandbox = sinon.createSandbox();
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
    it('Should return only the body for 200 OK', function () {
        const options = { uri: URI, resolveWithFullResponse: true };

        stub.resolves(GOOD_RESPONSE);
        return request.get(options)
            .should.be.fulfilledWith(GOOD_RESPONSE)
            .then(() => {
                should(stub.callCount).be.eql(1);
            });
    });
    it('Should return only the body for 500 OK', function () {
        const options = { uri: URI, simple: false, resolveWithFullResponse: true };

        stub.resolves(STRING_RESPONSE_500);
        return request.get(options)
            .should.be.fulfilledWith(STRING_RESPONSE_500)
            .then((response) => {
                should(stub.callCount).be.eql(1);
            });
    });
    it('Should return 500 response body after 3 attempts', function () {
        const options = { uri: URI, max: 3, retryOn5xx: true, simple: false, resolveWithFullResponse: true };

        const response = {
            statusCode: 500,
            body: 'body'
        };
        stub.resolves(response);
        return request.get(options)
            .should.be.fulfilledWith(response)
            .then((response) => {
                should(stub.callCount).be.eql(3);
            });
    });
    it('Should reject on 5xx status code after 3 attempts', function () {
        const options = { uri: URI, max: 3, retryOn5xx: true, rejectOn5xx: true, simple: false, resolveWithFullResponse: true };

        const response = {
            statusCode: 500,
            body: 'body'
        };
        stub.resolves(response);
        return request.get(options)
            .should.be.rejectedWith(new StatusCodeError(response))
            .then((response) => {
                should(stub.callCount).be.eql(3);
            });
    });
});

describe('When sending get request with max value set and retryStrategy given', function () {
    const fn = (response) => response.statusCode === 401;
    const sandbox = sinon.createSandbox();
    const options = { max: 3, retryStrategy: fn };
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

    it('Should return 200 OK response 1 attempt', function () {
        stub.resolves(GOOD_RESPONSE);
        return request.get(URI, options)
            .should.be.fulfilledWith(GOOD_RESPONSE.body)
            .then(() => {
                should(stub.callCount).be.eql(1);
            });
    });
    it('Should return a RequestError when retryStrategy fails with non-2xx status code after 3 attempts', function () {
        const response = {
            statusCode: 401,
            body: 'body'
        };
        stub.resolves(response);
        return request.get(URI, options)
            .should.be.rejectedWith(new StatusCodeError(response))
            .then((response) => {
                should(stub.callCount).be.eql(3);
            });
    });
    it('Should return a RequestError when retryStrategy fails with 200 after 3 attempts', function () {
        options.retryStrategy = (response) => true;
        const response = {
            statusCode: 200,
            body: 'body'
        };
        stub.resolves(response);
        return request.get(URI, options)
            .should.be.fulfilledWith(response.body)
            .then((response) => {
                should(stub.callCount).be.eql(3);
            });
    });
    it('Should not options when the condition is not met', function () {
        options.retryStrategy = () => false;

        const response = {
            statusCode: 403,
            body: 'body'
        };
        stub.resolves(response);
        return request.get(URI, options)
            .should.be.rejectedWith(new StatusCodeError(response))
            .then((response) => {
                should(stub.callCount).be.eql(1);
            });
    });
});

describe('When sending request with onSuccess and onError', function () {
    const sandbox = sinon.createSandbox();
    const onSuccess = sandbox.stub();
    const onError = sandbox.stub();
    const options = { max: 3, retryOn5xx: true, onSuccess, onError };
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

    it('Should call onSuccess', function () {
        const expectedOptions = Object.assign({
            uri: URI,
            resolveWithFullResponse: true,
            simple: false
        }, options);

        stub.resolves(GOOD_RESPONSE);
        return request.get(URI, options)
            .should.be.fulfilledWith(GOOD_RESPONSE.body)
            .then(() => {
                should(stub.callCount).be.eql(1);
                should(onSuccess.callCount).be.eql(1);
                sinon.assert.calledWithMatch(onSuccess, expectedOptions, GOOD_RESPONSE, 1);
                should(onError.callCount).be.eql(0);
            });
    });
    it('Should call onError for every attempt', function () {
        const expectedOptions = Object.assign({
            uri: URI,
            resolveWithFullResponse: true,
            simple: false
        }, options);

        stub.resolves(STRING_RESPONSE_500);
        return request.get(URI, options)
            .should.be.rejectedWith(new StatusCodeError(STRING_RESPONSE_500))
            .then((response) => {
                should(stub.callCount).be.eql(3);
                should(onSuccess.callCount).be.eql(0);
                should(onError.callCount).be.eql(3);
                sinon.assert.calledWithMatch(onError, expectedOptions, response, 3);
            });
    });
    it('Should call onError for non-2xx status code and simple=true', function () {
        const expectedOptions = Object.assign({
            uri: URI,
            simple: false
        }, options);

        const response = {
            statusCode: 400,
            body: 'body'
        };

        stub.resolves(response);
        return request.get(URI, options)
            .should.be.rejectedWith(new StatusCodeError(response))
            .then((response) => {
                should(stub.callCount).be.eql(1);
                should(onSuccess.callCount).be.eql(0);
                should(onError.callCount).be.eql(1);
                sinon.assert.calledWithMatch(onError, expectedOptions, response, 1);
            });
    });
    it('Should call onSuccess and onError', function () {
        stub.resolves(STRING_RESPONSE_500);
        stub.onCall(2).resolves(GOOD_RESPONSE);
        return request.get(URI, options)
            .should.be.fulfilledWith(GOOD_RESPONSE.body)
            .then((response) => {
                should(stub.callCount).be.eql(3);
                should(onSuccess.callCount).be.eql(1);
                should(onError.callCount).be.eql(2);
            });
    });
});

describe('When throwing an error', function () {
    const sandbox = sinon.createSandbox();
    const onSuccess = sandbox.stub();
    const onError = sandbox.stub();
    const options = { max: 3, retryOn5xx: true, onSuccess, onError };
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

    it('Should correctly throw error when there the response body is in JSON format', function () {
        const expectedError = new Error(`${JSON_RESPONSE_500.statusCode} - "${JSON.stringify(JSON_RESPONSE_500.body)}"`);
        expectedError.name = 'StatusCodeError';
        expectedError.response = JSON_RESPONSE_500;
        stub.resolves(JSON_RESPONSE_500);
        return request.get(URI, options)
            .should.be.rejected()
            .then((error) => {
                should(error).be.containDeep(expectedError);
                should(stub.callCount).be.eql(3);
            });
    });
    it('Should correctly throw error when there is no response body', function () {
        const response = {
            statusCode: 500
        };
        const expectedError = new Error(`${response.statusCode} - `);
        expectedError.name = 'StatusCodeError';
        expectedError.response = response;
        stub.resolves(response);
        return request.get(URI, options)
            .should.be.rejected()
            .then((error) => {
                should(error).be.containDeep(expectedError);
                should(stub.callCount).be.eql(3);
            });
    });
    it('Should correctly throw error when the response body is not a string', function () {
        const response = {
            statusCode: 500,
            body: 5
        };
        const expectedError = new Error(`${response.statusCode} - 5`);
        expectedError.name = 'StatusCodeError';
        expectedError.response = response;
        stub.resolves(response);
        return request.get(URI, options)
            .should.be.rejected()
            .then((error) => {
                should(error).be.containDeep(expectedError);
                should(stub.callCount).be.eql(3);
            });
    });
});

describe('When using .defaults', function () {
    const options = { max: 3, retryOn5xx: true };
    const sandbox = sinon.createSandbox();
    let stub;
    let requestWithDefaults;

    before(function () {
        stub = sandbox.stub(rp, 'get');
        requestWithDefaults = require('../index').defaults(options);
    });
    after(function () {
        stub.restore();
    });
    afterEach(function () {
        sandbox.resetHistory();
    });

    it('Should return 200 OK response 1 attempt', function () {
        stub.resolves(GOOD_RESPONSE);
        return requestWithDefaults.get(URI)
            .should.be.fulfilledWith(GOOD_RESPONSE.body)
            .then(() => {
                should(stub.callCount).be.eql(1);
            });
    });
    it('Should return 500 response after 3 attempts', function () {
        stub.resolves(STRING_RESPONSE_500);
        return requestWithDefaults.get(URI)
            .should.be.rejectedWith(new StatusCodeError(STRING_RESPONSE_500))
            .then((response) => {
                should(stub.callCount).be.eql(3);
            });
    });
    it('Should return 401 response after 1 attempt', function () {
        const response = {
            statusCode: 401,
            body: 'body'
        };
        stub.resolves(response);
        return requestWithDefaults.get(URI)
            .should.be.rejectedWith(new StatusCodeError(response))
            .then((response) => {
                should(stub.callCount).be.eql(1);
            });
    });
    it('Should apply new simple value', function () {
        const overridingOptions = { simple: false };
        const response = {
            statusCode: 401,
            body: 'body'
        };
        stub.resolves(response);
        return requestWithDefaults.get(URI, overridingOptions)
            .should.be.fulfilledWith(response.body)
            .then((response) => {
                should(stub.callCount).be.eql(1);
            });
    });
    it('Should apply new max value', function () {
        const overridingOptions = { max: 5, simple: false };

        stub.resolves(STRING_RESPONSE_500);
        return requestWithDefaults.get(URI, overridingOptions)
            .should.be.fulfilledWith(STRING_RESPONSE_500.body)
            .then((response) => {
                should(stub.callCount).be.eql(5);
            });
    });
    it('Should return an error on rejection (network error) after 3 attempts', function () {
        const error = new Error('getaddrinfo ENOTFOUND');
        stub.rejects(error);
        return requestWithDefaults.get(URI)
            .should.be.rejectedWith(error)
            .then((response) => {
                should(stub.callCount).be.eql(3);
            });
    });
    describe('Should support nested defaults', function () {
        const overridingOptions = { max: 2 };
        let requestWithNewDefaults;

        before(function () {
            requestWithNewDefaults = requestWithDefaults.defaults(overridingOptions);
        });

        it('Should apply new max value', function () {
            const error = new Error('getaddrinfo ENOTFOUND');
            stub.rejects(error);

            return requestWithNewDefaults.get(URI)
                .should.be.rejectedWith(error)
                .then((response) => {
                    should(stub.callCount).be.eql(2);
                });
        });
        it('Should retry on 5xx', function () {
            stub.resolves(STRING_RESPONSE_500);

            return requestWithNewDefaults.get(URI)
                .should.be.rejectedWith(new StatusCodeError(STRING_RESPONSE_500))
                .then(() => {
                    should(stub.callCount).be.eql(2);
                });
        });
    });
});

describe('On request errors', function () {
    const sandbox = sinon.createSandbox();
    let getSpy;
    let postSpy;
    let request;
    before(function () {
        getSpy = sandbox.spy(rp, 'get');
        postSpy = sandbox.spy(rp, 'post');
        request = require('../index');
    });
    after(function () {
        sandbox.restore();
    });
    afterEach(function () {
        sandbox.resetHistory();
        nock.cleanAll();
    });

    it('Should retry on request error', function () {
        const error = new Error('Chuck Norris doesn\'t get exceptions, exceptions gets Chuck Norris');
        const server = nock(URI)
            .get('/')
            .times(2)
            .replyWithError(error)
            .get('/')
            .reply(200, 'body');

        return request.get({ uri: URI, max: 3, timeout: 100 })
            .should.be.fulfilledWith('body')
            .then(() => {
                should(getSpy.callCount).be.eql(3);
                should(server.pendingMocks()).have.lengthOf(0);
            });
    });

    it('Should retry on connection timeout', function () {
        const server = nock(URI)
            .get('/')
            .times(3)
            .replyWithError(socketTimeoutError);

        return request.get({ uri: URI, max: 3, timeout: 1, backoffBase: 100 })
            .should.be.rejectedWith('Error: ESOCKETTIMEDOUT')
            .then(() => {
                should(getSpy.callCount).be.eql(3);
                should(server.pendingMocks()).have.lengthOf(0);
            });
    });

    it('Should not retry on read timeout when excludeErrorsFromRetry has socket time value', function () {
        const server = nock(URI)
            .get('/')
            .replyWithError(socketTimeoutError);

        return request.get({ uri: URI, max: 3, timeout: 1, backoffBase: 100, excludeErrorsFromRetry: ['ESOCKETTIMEDOUT'] })
            .should.be.rejectedWith('Error: ESOCKETTIMEDOUT')
            .then(() => {
                should(getSpy.callCount).be.eql(1);
                should(server.pendingMocks()).have.lengthOf(0);
            });
    });

    it('Should not retry on connection timeout when excludeErrorsFromRetry connection socket time value', function () {
        const server = nock(URI)
            .get('/')
            .replyWithError(timeoutError);

        return request.get({ uri: URI, max: 3, timeout: 1, backoffBase: 100, excludeErrorsFromRetry: ['ETIMEDOUT'] })
            .should.be.rejected()
            .then(() => {
                should(getSpy.callCount).be.eql(1);
                should(server.pendingMocks()).have.lengthOf(0);
            });
    });

    it('Should retry on connection timeout when excludeErrorsFromRetry is exists but does not have the specific error', function () {
        const server = nock(URI)
            .get('/')
            .times(3)
            .replyWithError(socketTimeoutError);

        return request.get({ uri: URI, max: 3, timeout: 1, backoffBase: 100, excludeErrorsFromRetry: ['some_error'] })
            .should.be.rejectedWith('Error: ESOCKETTIMEDOUT')
            .then(() => {
                should(getSpy.callCount).be.eql(3);
                should(server.pendingMocks()).have.lengthOf(0);
            });
    });

    it('Should retry on connection timeout for POST request', function () {
        const server = nock(URI)
            .post('/')
            .times(3)
            .replyWithError(socketTimeoutError);

        return request({ method: 'post', uri: URI, max: 3, timeout: 1, backoffBase: 100 })
            .should.be.rejectedWith('Error: ESOCKETTIMEDOUT')
            .then(() => {
                should(postSpy.callCount).be.eql(3);
                should(server.pendingMocks()).have.lengthOf(0);
            });
    });
});

const socketTimeoutError = new Error('ESOCKETTIMEDOUT');
socketTimeoutError.code = 'ESOCKETTIMEDOUT';

const notFoundError = new Error('ENOTFOUND');
notFoundError.code = 'ENOTFOUND';

const timeoutError = new Error('ETIMEDOUT');
timeoutError.code = 'ETIMEDOUT';

