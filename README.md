[![NPM Version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Test Coverage][coveralls-image]][coveralls-url]
[![NPM Downloads][downloads-image]][downloads-url]

[![NPM](https://nodei.co/npm/requestxn.png?downloads=true&downloadRank=true&stars=true)][npm-stats]
# requestXn

Wraps both request-promise-native with a retry handler, in order to provide an easy way to send requests with retries with a promises.

## API
requestxn should support all [request-promise-native](https://github.com/request/request-promise-native) functionality, so you can pass all options as you would pass them to the original package

In addition to the original *request-promise* options, the following extra options are accepted
#### max
Maximum number of attempts. Default: 1
```js
max: 1
```

#### backoffBase (Default: 100)
Initial backoff duration in ms. Default: 100
```js
backoffBase: 100
```

#### backoffExponent (Default: 1.1)
Exponent to increase backoff on each attempt. Default: 1.1
```js
backoffExponent: 1.1
```

#### retryOn5xx
Enable retry on 5xx error. Default: false
```js
retryOn5xx: true
```

#### retryStrategy
Custom retry logic function
```js
retryStrategy: function (response) {
  // return a boolean
}
```

#### onSuccess
Function to be executed on success
```js
onSuccess: function (request, response, errorCount) {
    // do something on success
}
```

#### onError
Function to be executed on error
```js
onError: function (request, error, errorCount) {
  // do something on error
}
```
#### Usage
```js
const request = require('requestxn');

const options = {
  url: 'http://www.site-with-issues.com',
  body: {/* body */},
  json: true,
  max: 3,
  backoffBase: 500,
  backoffExponent: 1.3,
  retryOn5xx: true,
  retryStrategyFn: function(response) {
    return response.statusCode === 500 && response.body.match(/Temporary error/);
  },
  onError: function(request, error, errorCount) {
    console.error(`- Request to ${request.url} failed on the ${retries} attempt with error ${error.message}`);
  },
  onSuccess: function(request, response) {
    console.info(`- Got status-code ${response.statusCode} on request to ${request.url}`);
  }
}
```

#### Result
```js
> request.post(options).then()...
- "Request to http://www.site-with-issues.com failed on the 1 attempt with RequestError: Error: getaddrinfo ENOTFOUND www.site-with-issues.com www.site-with-issues.com:80"
- "Request to http://www.site-with-issues.com failed on the 2 attempt with RequestError: Error: getaddrinfo ENOTFOUND www.site-with-issues.com www.site-with-issues.com:80"
- "Got status-code 200 on request to http://www.site-with-issues.com"
```

#### Usage with defaults
```js
const request = require('requestxn');

const requestWithDefaults = request.defaults({
  json: true,
  max: 3,
  backoffBase: 500,
  retryOn5xx: true,
  retryStrategy: function(response) {
    return response.statusCode === 500 && response.body.match(/Temporary error/);
  },
  onError: function(request, error, errorCount) {
    console.error(`- Request to ${request.url} failed on the ${retries} attempt with error ${error.message}`);
  },
  onSuccess: function(request, response) {
    console.info(`- Got status-code ${response.statusCode} on request to ${request.url}`);
  }
});

requestWithDefaults.get('http://www.site-with-issues.com').then...
```
[npm-image]: https://img.shields.io/npm/v/requestxn.svg?style=flat
[npm-url]: https://npmjs.org/package/requestxn
[travis-image]: https://travis-ci.org/kobik/requestxn.svg?branch=master
[travis-url]: https://travis-ci.org/kobik/requestxn
[coveralls-image]: https://coveralls.io/repos/github/kobik/requestxn/badge.svg?branch=master
[coveralls-url]: https://coveralls.io/repos/github/kobik/requestxn/badge.svg?branch=master
[downloads-image]: http://img.shields.io/npm/dm/requestxn.svg?style=flat
[downloads-url]: https://npmjs.org/package/requestxn
[npm-stats]: https://nodei.co/npm/requestxn/