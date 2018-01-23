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
describe('Validation checks', function() {
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

    it('Should throw an error when onSuccess is not a function', function() {
        return request.get({uri: URI, onSuccess: 'string'})
            .should.be.rejectedWith('onSuccess must be a function')
            .then(() => {
                should(stub.callCount).eql(0);
            });
    });
    it('Should throw an error when onError is not a function', function() {
        return request.get({uri: URI, onError: 'string'})
            .should.be.rejectedWith('onError must be a function')
            .then(() => {
                should(stub.callCount).eql(0);
            });
    });
    it('Should throw an error when retryStrategy is not a function', function() {
        return request.get({uri: URI, retryStrategy: 'string'})
            .should.be.rejectedWith('retryStrategy must be a function')
            .then(() => {
                should(stub.callCount).eql(0);
            });
    });
});

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
    it('Should return 200 OK response after 1 attempt', function () {
        stub.resolves(GOOD_RESPONSE);
        return request.get(URI)
            .should.be.fulfilledWith(GOOD_RESPONSE.body)
            .then(() => {
                should(stub.callCount).eql(1);
            });
    });
    it('Should return 500 response after 1 attempt', function () {
        stub.resolves(STRING_RESPONSE_500);
        return request.get(URI)
            .should.be.rejectedWith(new StatusCodeError(STRING_RESPONSE_500))
            .then(() => {
                should(stub.callCount).eql(1);
            });
    });
    it('Should return an error after 1 attempt', function () {
        const error = new Error('some error');
        stub.rejects(error);
        return request.get(URI)
            .should.be.rejectedWith(error)
            .then((response) => {
                should(stub.callCount).eql(1);
            });
    });
});

describe('When sending get request with max value set', function () {
    const options = {max: 3};
    let sandbox;
    let stub;
    let request;
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
    it('Should return 200 OK response 1 attempt', function () {
        stub.resolves(GOOD_RESPONSE);
        return request.get(URI, options)
            .should.be.fulfilledWith(GOOD_RESPONSE.body)
            .then(() => {
                should(stub.callCount).eql(1);
            });
    });
    it('Should return 500 response after 1 attempt', function () {
        stub.resolves(STRING_RESPONSE_500);
        return request.get(URI, options)
            .should.be.rejectedWith(new StatusCodeError(STRING_RESPONSE_500))
            .then((response) => {
                should(stub.callCount).eql(1);
            });
    });
    it('Should return 500 response after 1 attempt', function () {
        stub.resolves(STRING_RESPONSE_500);
        return request.get(URI, options)
            .should.be.rejectedWith(new StatusCodeError(STRING_RESPONSE_500))
            .then(() => {
                should(stub.callCount).eql(1);
            });
    });
    it('Should return an error after 3 attempts', function () {
        const error = new Error('RequestError');
        stub.rejects(error);
        return request.get(URI, options)
            .should.be.rejectedWith(error)
            .then((response) => {
                should(stub.callCount).eql(3);
            });
    });
});

describe('When sending request with the default max value and retryOn5xx set to true', function () {
    const options = {retryOn5xx: true};
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
    it('Should return 200 OK response 1 attempt', function () {
        stub.resolves(GOOD_RESPONSE);
        return request.get(URI, options)
            .should.be.fulfilledWith(GOOD_RESPONSE.body)
            .then(() => {
                should(stub.callCount).eql(1);
            });
    });
    it('Should return 500 response after 1 attempt', function () {
        stub.resolves(STRING_RESPONSE_500);
        return request.get(URI, options)
            .should.be.rejectedWith(new StatusCodeError(STRING_RESPONSE_500))
            .then((response) => {
                should(stub.callCount).eql(1);
            });
    });
});

describe('When sending request with the default max value and retryOn5xx set to true', function () {
    const options = {retryOn5xx: true, simple: false};
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
    it('Should return 200 OK response 1 attempt', function () {
        stub.resolves(GOOD_RESPONSE);
        return request.get(URI, options)
            .should.be.fulfilledWith(GOOD_RESPONSE.body)
            .then(() => {
                should(stub.callCount).eql(1);
            });
    });
    it('Should return 500 response after 1 attempt', function () {
        stub.resolves(STRING_RESPONSE_500);
        return request.get(URI, options)
            .should.be.fulfilledWith(STRING_RESPONSE_500.body)
            .then((response) => {
                should(stub.callCount).eql(1);
            });
    });
    it('Should return an error after 1 attempt', function () {
        const error = new Error('err');
        stub.rejects(error);
        return request.get(URI, options)
            .should.be.rejectedWith(error)
            .then((response) => {
                should(stub.callCount).eql(1);
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
                should(stub.callCount).eql(1);
            });
    });
});

describe('When sending get request with max value set to 3 and retryOn5xx set to true', function () {
    const options = {max: 3, retryOn5xx: true};
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
    it('Should return 200 OK response 1 attempt', function () {
        stub.resolves(GOOD_RESPONSE);
        return request.get(URI, options)
            .should.be.fulfilledWith(GOOD_RESPONSE.body)
            .then(() => {
                should(stub.callCount).eql(1);
            });
    });
    it('Should return 500 response after 3 attempts', function () {
        stub.resolves(STRING_RESPONSE_500);
        return request.get(URI, options)
            .should.be.rejectedWith(new StatusCodeError(STRING_RESPONSE_500))
            .then((response) => {
                should(stub.callCount).eql(3);
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
                should(stub.callCount).eql(1);
            });
    });
    it('Should return an error on rejection (network error) after 3 attempts', function () {
        const error = new Error('getaddrinfo ENOTFOUND');
        stub.rejects(error);
        return request.get(URI, options)
            .should.be.rejectedWith(error)
            .then((response) => {
                should(stub.callCount).eql(3);
            });
    });
});

describe('When sending get request with retryOn5xx set to true and simple set to false', function () {
    const options = {max: 3, retryOn5xx: true, simple: false};
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
    it('Should return 200 OK response 1 attempt', function () {
        stub.resolves(GOOD_RESPONSE);
        return request.get(URI, options)
            .should.be.fulfilledWith(GOOD_RESPONSE.body)
            .then(() => {
                should(stub.callCount).eql(1);
            });
    });
    it('Should return 500 response body after 3 attempts', function () {
        stub.resolves(STRING_RESPONSE_500);
        return request.get(URI, options)
            .should.be.fulfilledWith(STRING_RESPONSE_500.body)
            .then((response) => {
                should(stub.callCount).eql(3);
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
                should(stub.callCount).eql(1);
            });
    });
    it('Should return an error on rejection (network error) after 3 attempts', function () {
        const error = new Error('getaddrinfo ENOTFOUND');
        stub.rejects(error);
        return request.get(URI, options)
            .should.be.rejectedWith(error)
            .then((response) => {
                should(stub.callCount).eql(3);
            });
    });
});

describe('When setting resolveWithFullResponse=false', function () {
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
    it('Should return only the body for 200 OK', function () {
        const options = {resolveWithFullResponse: false};

        stub.resolves(GOOD_RESPONSE);
        return request.get(URI, options)
            .should.be.fulfilledWith(GOOD_RESPONSE.body)
            .then(() => {
                should(stub.callCount).eql(1);
            });
    });
    it('Should return only the body for 500 OK', function () {
        const options = {simple: false, resolveWithFullResponse: false};

        stub.resolves(STRING_RESPONSE_500);
        return request.get(URI, options)
            .should.be.fulfilledWith(STRING_RESPONSE_500.body)
            .then((response) => {
                should(stub.callCount).eql(1);
            });
    });
    it('Should return 500 response body when retryOn5xx=true', function () {
        const options = {max: 3, retryOn5xx: true, simple: false, resolveWithFullResponse: false};

        const response = {
            statusCode: 500,
            body: 'body'
        };
        stub.resolves(response);
        return request.get(URI, options)
            .should.be.fulfilledWith(response.body)
            .then((response) => {
                should(stub.callCount).eql(3);
            });
    });
});

describe('When setting resolveWithFullResponse=true', function () {
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
    it('Should return only the body for 200 OK', function () {
        const options = {resolveWithFullResponse: true};

        stub.resolves(GOOD_RESPONSE);
        return request.get(URI, options)
            .should.be.fulfilledWith(GOOD_RESPONSE)
            .then(() => {
                should(stub.callCount).eql(1);
            });
    });
    it('Should return only the body for 500 OK', function () {
        const options = {simple: false, resolveWithFullResponse: true};

        stub.resolves(STRING_RESPONSE_500);
        return request.get(URI, options)
            .should.be.fulfilledWith(STRING_RESPONSE_500)
            .then((response) => {
                should(stub.callCount).eql(1);
            });
    });
    it('Should return 500 after 3 attempts when retryOn5xx=true', function () {
        const options = {max: 3, retryOn5xx: true, simple: false, resolveWithFullResponse: true};

        stub.resolves(STRING_RESPONSE_500);
        return request.get(URI, options)
            .should.be.fulfilledWith(STRING_RESPONSE_500)
            .then((response) => {
                should(stub.callCount).eql(3);
            });
    });
});

describe('When passing all options as the first argument', function () {
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
    it('Should return only the body for 200 OK', function () {
        const options = {uri: URI, resolveWithFullResponse: true};

        stub.resolves(GOOD_RESPONSE);
        return request.get(options)
            .should.be.fulfilledWith(GOOD_RESPONSE)
            .then(() => {
                should(stub.callCount).eql(1);
            });
    });
    it('Should return only the body for 500 OK', function () {
        const options = {uri: URI, simple: false, resolveWithFullResponse: true};

        stub.resolves(STRING_RESPONSE_500);
        return request.get(options)
            .should.be.fulfilledWith(STRING_RESPONSE_500)
            .then((response) => {
                should(stub.callCount).eql(1);
            });
    });
    it('Should return 500 response body after 3 attempts', function () {
        const options = {uri: URI, max: 3, retryOn5xx: true, simple: false, resolveWithFullResponse: true};

        const response = {
            statusCode: 500,
            body: 'body'
        };
        stub.resolves(response);
        return request.get(options)
            .should.be.fulfilledWith(response)
            .then((response) => {
                should(stub.callCount).eql(3);
            });
    });
});

describe('When sending get request with max value set and retryStrategy given', function () {
    const fn = (response) => response.statusCode === 401;
    const sandbox = sinon.sandbox.create();
    const options = {max: 3, retryStrategy: fn};
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
                should(stub.callCount).eql(1);
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
                should(stub.callCount).eql(3);
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
                should(stub.callCount).eql(3);
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
                should(stub.callCount).eql(1);
            });
    });
});

describe('When sending request with onSuccess and onError', function () {
    const sandbox = sinon.sandbox.create();
    const onSuccess = sandbox.stub();
    const onError = sandbox.stub();
    const options = {max: 3, retryOn5xx: true, onSuccess, onError};
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
                should(stub.callCount).eql(1);
                should(onSuccess.callCount).eql(1);
                sinon.assert.calledWithMatch(onSuccess, expectedOptions, GOOD_RESPONSE, 1);
                should(onError.callCount).eql(0);
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
                should(stub.callCount).eql(3);
                should(onSuccess.callCount).eql(0);
                should(onError.callCount).eql(3);
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
                should(stub.callCount).eql(1);
                should(onSuccess.callCount).eql(0);
                should(onError.callCount).eql(1);
                sinon.assert.calledWithMatch(onError, expectedOptions, response, 1);
            });
    });
    it('Should call onSuccess and onError', function () {
        stub.resolves(STRING_RESPONSE_500);
        stub.onCall(2).resolves(GOOD_RESPONSE);
        return request.get(URI, options)
            .should.be.fulfilledWith(GOOD_RESPONSE.body)
            .then((response) => {
                should(stub.callCount).eql(3);
                should(onSuccess.callCount).eql(1);
                should(onError.callCount).eql(2);
            });
    });
});

describe('When throwing an error', function () {
    const sandbox = sinon.sandbox.create();
    const onSuccess = sandbox.stub();
    const onError = sandbox.stub();
    const options = {max: 3, retryOn5xx: true, onSuccess, onError};
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
                should(stub.callCount).eql(3);
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
                should(stub.callCount).eql(3);
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
                should(stub.callCount).eql(3);
            });
    });
});

describe('When using .defaults', function () {
    const options = {max: 3, retryOn5xx: true};
    const sandbox = sinon.sandbox.create();
    let stub;
    let request;

    before(function () {
        stub = sandbox.stub(rp, 'get');
        request = require('../index').defaults(options);
    });
    after(function () {
        stub.restore();
    });
    afterEach(function () {
        sandbox.resetHistory();
    });

    it('Should return 200 OK response 1 attempt', function () {
        stub.resolves(GOOD_RESPONSE);
        return request.get(URI)
            .should.be.fulfilledWith(GOOD_RESPONSE.body)
            .then(() => {
                should(stub.callCount).eql(1);
            });
    });
    it('Should return 500 response after 3 attempts', function () {
        stub.resolves(STRING_RESPONSE_500);
        return request.get(URI)
            .should.be.rejectedWith(new StatusCodeError(STRING_RESPONSE_500))
            .then((response) => {
                should(stub.callCount).eql(3);
            });
    });
    it('Should return 401 response after 1 attempt', function () {
        const response = {
            statusCode: 401,
            body: 'body'
        };
        stub.resolves(response);
        return request.get(URI)
            .should.be.rejectedWith(new StatusCodeError(response))
            .then((response) => {
                should(stub.callCount).eql(1);
            });
    });
    it('Should apply new simple value', function () {
        const overridingOptions = {simple: false};
        const response = {
            statusCode: 401,
            body: 'body'
        };
        stub.resolves(response);
        return request.get(URI, overridingOptions)
            .should.be.fulfilledWith(response.body)
            .then((response) => {
                should(stub.callCount).eql(1);
            });
    });
    it('Should apply new max value', function () {
        const overridingOptions = {max: 5, simple: false};

        stub.resolves(STRING_RESPONSE_500);
        return request.get(URI, overridingOptions)
            .should.be.fulfilledWith(STRING_RESPONSE_500.body)
            .then((response) => {
                should(stub.callCount).eql(5);
            });
    });
    it('Should return an error on rejection (network error) after 3 attempts', function () {
        const error = new Error('getaddrinfo ENOTFOUND');
        stub.rejects(error);
        return request.get(URI)
            .should.be.rejectedWith(error)
            .then((response) => {
                should(stub.callCount).eql(3);
            });
    });
});

describe('On connection issues', function () {
    const sandbox = sinon.sandbox.create();
    let getSpy;
    let postSpy;
    let request;
    before(function () {
        getSpy = sandbox.spy(rp, 'get');
        postSpy = sandbox.spy(rp, 'post');
        request = require('../index');
    });
    after(function () {
        getSpy.restore();
    });
    afterEach(function () {
        sandbox.resetHistory();
        nock.cleanAll();
    });

    it('Should retry on connection error', function () {
        const error = new Error('Chuck Norris doesn`t get exceptions, exceptions gets Chuck Norris');
        const server = nock(URI)
            .get('/')
            .replyWithError(error)
            .get('/')
            .replyWithError(error)
            .get('/')
            .reply(200, 'body');

        return request.get({uri: URI, max: 3, timeout: 100})
            .should.be.fulfilledWith('body')
            .then(() => {
                should(getSpy.callCount).eql(3);
                server.isDone();
            });
    });

    it('Should retry on connection timeout', function () {
        const server = nock(URI)
            .get('/')
            .socketDelay(1000)
            .reply(200, 'body')
            .get('/')
            .socketDelay(1000)
            .reply(200, 'body')
            .get('/')
            .socketDelay(1000)
            .reply(200, 'body');

        return request.get({uri: URI, max: 3, timeout: 1, backoffBase: 100})
            .should.be.rejectedWith('Error: ESOCKETTIMEDOUT')
            .then(() => {
                should(getSpy.callCount).eql(3);
                server.isDone();
            });
    });
    it('Should retry on connection timeout for POST request', function () {
        const server = nock(URI)
            .post('/')
            .socketDelay(1000)
            .reply(200, 'body')
            .post('/')
            .socketDelay(1000)
            .reply(200, 'body')
            .post('/')
            .socketDelay(1000)
            .reply(200, 'body');

        return request({method: 'POST', uri: URI, max: 3, timeout: 1, backoffBase: 100})
            .should.be.rejectedWith('Error: ESOCKETTIMEDOUT')
            .then(() => {
                should(postSpy.callCount).eql(3);
                server.isDone();
            });
    });
});