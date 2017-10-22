let ra = require('./index');

var test = ra.defaults({
    retry: {
        max: 3,
        retryStrategyFn: function (response) {
            return response.statusCode === 405;
        },
        logFn: function (error, count) {
            console.info('--------');
            console.info(error, count);
        }
    }
});
var test2 = ra.defaults();
// ra.post('http://www.google.com')
test.post('http://www.google.com')
// test.post('http://www.google.com', {retry: {max: 2}})
// test.post({url: 'http://www.google.com', retry: {max: 2}})
    .then((res) => {
        console.info(res);
    })
    .catch((error) => {
        console.info(error.retries);
        throw error;
    });