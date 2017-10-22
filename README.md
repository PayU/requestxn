# RetQuest

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Test Coverage][coveralls-image]][coveralls-url]

```js
var rq = require('retquest');

var options = {
  url: 'http://www.some-site.com',
  simple: false,
  retry: {
    max: 3,
    backoffBase: 500,
    retryOn5xx: true,
    retryStrategyFn: function(response) {
      return response.body.match(/Temporary error/);
    },
    logFn: function(request, error) {
      console.error(`Request to ${request.url} failed on the ${error.retries} attempt with error ${error}`);
    }
  }
}
return rq.post(options)
  .catch((error) => {
    console.log({
      retries: error.retries,
      error: error
    });
  })
```

```log
Request to http://www.non-existing-url.com failed on the 1 attempt with RequestError: Error: getaddrinfo ENOTFOUND www.non-existing-url.com www.non-existing-url.com:80
Request to http://www.non-existing-url.com failed on the 2 attempt with RequestError: Error: getaddrinfo ENOTFOUND www.non-existing-url.com www.non-existing-url.com:80
Request to http://www.non-existing-url.com failed on the 3 attempt with RequestError: Error: getaddrinfo ENOTFOUND www.non-existing-url.com www.non-existing-url.com:80
```