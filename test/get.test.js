let reqtry = require('../index');
let rp = require('request-promise-native');
let sinon = require('sinon');
let should = require('should');
let Http = require('http');
let Promise = require('bluebird');

describe('When sending get request', function () {
    let sandbox;
    let stub;
    before(function () {
        sandbox = sinon.sandbox.create();
        stub = sandbox.stub(rp, 'get');
    });
    after(function () {
        stub.restore();
    });
    beforeEach(function () {
        stub.reset();
    });
    it('Should return 200 OK response', function () {
        let response = {
            statusCode: 200,
            body: 'body'
        };
        stub.resolves(response);
        return reqtry.get('www.google.com').should.fulfilledWith(response)
            .then(() => {
                should(stub.callCount).eql(1);
            });
    });
    it('Should return 500 response', function () {
        let response = {
            statusCode: 500,
            body: 'body'
        };
        stub.resolves(response);
        return reqtry.get('www.google.com').should.fulfilledWith(response)
            .then(() => {
                should(stub.callCount).eql(1);
            });
    });
});
describe('When sending get request with retries', function () {
    let sandbox;
    let stub;
    before(function () {
        sandbox = sinon.sandbox.create();
        stub = sandbox.stub(rp, 'get');
    });
    after(function () {
        stub.restore();
    });
    beforeEach(function () {
        stub.reset();
    });
    it('Should return 200 OK response', function () {
        let response = {
            statusCode: 200,
            body: 'body'
        };
        stub.resolves(response);
        return reqtry.get('www.google.com', {max: 3}).should.fulfilledWith(response)
            .then(() => {
                should(stub.callCount).eql(1);
            });
    });
    it('Should return 500 response', function () {
        let response = {
            statusCode: 500,
            body: 'body'
        };
        stub.resolves(response);
        return reqtry.get('www.google.com', {max: 3, retry5xx: true, backoffBase: 100}).should.rejectedWith(response)
            .then((response) => {
                console.info(response);
                should(stub.callCount).eql(3);
            });
    });
});

// describe.only('', function () {
//     it('dasd', function() {
//         return rp.post('http://www.google.com');
//     });
// });
describe.only('', function () {
    let agent; ;
    before(function () {
        agent = new Http.Agent({
            keepAlive: true
        });
    });
    it('dasd', function() {
        reqtry.defaults({
            retry: {
                retry5xx: true,
                max: 2,
                backoffBase: 100,
                retryStrategyFn: function(response) {
                    return response.body.match(/Temporary error/);
                },
                logErrorFn: function(request, error, retries) {
                    console.error(`Request to ${request.url} failed on the ${retries} attempt with ${error}`);
                }
            }
        });
        return reqtry.post({
            url: 'http://www.google.com',
            resolveWithFullResponse: true,
            agent: agent,
            retry: {
                max: 3,
                stam: 5
            }
        })
            .catch((response) => {
                console.info(response.retries);
                throw response;
            });
        // .catch(() => Promise.delay(8000))
        // .then(() => reqtry.post({
        //     url: 'http://www.google.com',
        //     resolveWithFullResponse: true,
        //     agent: agent,
        //     retry: {
        //         max: 1,
        //         stam: 5
        //     }
        // }));
    });
});