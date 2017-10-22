# request-again

<!-- [![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Test Coverage][coveralls-image]][coveralls-url] -->

```js
var ra = require('request-again');

var options = {
  url: 'http://www.site-with-issues.com',
  simple: false,
  retry: {
    max: 3,
    backoffBase: 500,
    retryOn5xx: true,
    retryStrategyFn: function(response) {
      return response.statusCode === 500 && response.body.match(/Temporary error/);
    },
    errorFn: function(request, error, errorCount) {
      console.error(`- Request to ${request.url} failed on the ${retries} attempt with error ${error.message}`);
    },
    successFn: function(request, response) {
      console.error(`- Got status-code ${response.statusCode} on request to ${request.url}`);
    }
  }
}
```

```log
> ra.post(options)
- Request to http://www.site-with-issues.com failed on the 1 attempt with RequestError: Error: getaddrinfo ENOTFOUND www.site-with-issues.com www.site-with-issues.com:80
- Request to http://www.site-with-issues.com failed on the 2 attempt with RequestError: Error: getaddrinfo ENOTFOUND www.site-with-issues.com www.site-with-issues.com:80
- Got status-code 200 on request to http://www.site-with-issues.com
```

## API
request-again should support all request-promise-native functionality, so you can pass all options as you would pass the original package.

### retry
Supports all retry-as-promised options - https://www.npmjs.com/package/retry-as-promised.
In addition to retry-as-promised options, the following options are accepted:

#### retryOn5xx
a boolean that allows to do a retry on 5xx errors

#### retryStrategyFn
a function that is used to decide on what other cases to do a retry

#### errorFn
a function that is called on error

#### successFn
a function that is called on success