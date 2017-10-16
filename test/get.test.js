let rpRetry = require('../index');
let rp = require('request-promise');
let sinon = require('sinon');
let should = require('should');

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
        return rpRetry.get('www.google.com').should.fulfilledWith(response)
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
        return rpRetry.get('www.google.com').should.fulfilledWith(response)
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
        return rpRetry.get('www.google.com', {max: 3}).should.fulfilledWith(response)
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
        return rpRetry.get('www.google.com', {max: 3, retry5xx: true, backoffBase: 100}).should.rejectedWith(response)
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
    it('dasd', function() {
        rpRetry.defaults({
            retry: {
                retry5xx: true,
                max: 2
            }
        });
        return rpRetry.post({
            url: 'http://www.google.com',
            resolveWithFullResponse: true,
            retry: {
                max: 3,
                stam: 5
            }
        }).then((response) => {
            console.info(response.statusCode);
            console.info(response.body);
            console.info(response.retries);
        }).catch((error) => {
            console.info(error.errors);
        });
    });
});