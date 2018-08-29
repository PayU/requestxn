[![NPM Version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Test Coverage][coveralls-image]][coveralls-url]
[![NPM Downloads][downloads-image]][downloads-url]
<!-- [![Maintainability][codeclimate-maintainability-image]][codeclimate-maintainability-url] -->
<!-- [![Test Coverage][codeclimate-coverage-image]][codeclimate-coverage-url] -->

# requestXn

**Notice** As from version 3.0.0 only node versions 8 and above are supported

Wraps request-promise with a retry handler, in order to provide an easy way to send requests with retries and promises.

[![NPM](https://nodei.co/npm/requestxn.png?downloads=true&downloadRank=true&stars=true)][npm-stats]

- [Options](#options)
  - [max](#max)
  - [retryOn5xx](#retryon5xx)
  - [rejectOn5xx](#rejecton5xx)
  - [retryStrategy](#retrystrategy)
  - [backoffBase](#backoffbase)
  - [backoffExponent](#backoffexponent)
  - [onSuccess](#onsuccess)
  - [onError](#onerror)
- [Example](#example)

## Options

requestXn supports all [request-promise-native](https://github.com/request/request-promise-native) functionality, so you can pass all options as you would pass them to the original package

In addition to the original *request-promise* options, the following extra options are available

### max

Maximum number of attempts. Default: 1

If you would like requestXn to retry on a network error, set this options to a value above 1.

This handles all non-HTTP errors including ENOTFOUND, ECONNRESET, ECONNREFUSED, and ETIMEOUT. 

```js
max: 1
```

### retryOn5xx

Retry on 5xx status codes. Default: false

Make requestXn also retry in case of 5xx status codes.

```js
retryOn5xx: true
```

### rejectOn5xx

Reject when getting 5xx status code and simple=false. Default: false

By default, requestXn would resolve with the response when simple=false.

By setting this option to true, requestXn behavior is changed to reject on such cases.

```js
rejectOn5xx: true
```

### retryStrategy

Custom retry logic function

```js
retryStrategy: function (response) {
  // return a boolean
}
```

### backoffBase

Initial backoff duration in ms. Default: 100

```js
backoffBase: 100
```

### backoffExponent

Exponent to increase backoff on each attempt. Default: 1.1

```js
backoffExponent: 1.1
```

### onSuccess

Function to be executed on success
New in v3.0.0: Support async functions

```js
onSuccess: function (options, response, attempts) {
    // do something on success
}
```

### onError

Function to be executed on error
New in v3.0.0: Support async functions

```js
onError: function (options, error, attempts) {
  // do something on error
}
```

### Example

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
  retryStrategy: function(response) {
    return response.statusCode === 500 && response.body.match(/Temporary error/);
  },
  onError: function(options, error, attempts) {
    console.error(`- Request to ${options.uri} failed on the ${attempts} attempt with error ${error.message}`);
  },
  onSuccess: function(options, response, attempts) {
    console.info(`- Got status-code ${response.statusCode} on request to ${request.uri} after ${attempts}`);
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
[travis-image]: https://travis-ci.org/Zooz/requestxn.svg?branch=master
[travis-url]: https://travis-ci.org/Zooz/requestxn
[coveralls-image]: https://coveralls.io/repos/github/Zooz/requestxn/badge.svg?branch=master
[coveralls-url]: https://coveralls.io/repos/github/Zooz/requestxn/badge.svg?branch=master
[downloads-image]: http://img.shields.io/npm/dm/requestxn.svg?style=flat
[downloads-url]: https://npmjs.org/package/requestxn
[npm-stats]: https://nodei.co/npm/requestxn/
