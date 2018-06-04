const REQUEST_TIMEOUT_ERROR_STRINGS = ['ETIMEDOUT', 'ESOCKETTIMEDOUT'];

const pause = (duration) => new Promise(resolve => setTimeout(resolve, duration));

const backoff = (fn, {max, backoffBase = 100, backoffExponent = 1.1, disableTimeoutRetry}) =>
    fn().catch(error => {
        if (max > 1 && (!disableTimeoutRetry || !REQUEST_TIMEOUT_ERROR_STRINGS.includes(error.error.code))) {
            return pause(backoffBase)
                .then(() => backoff(fn, {
                    max: --max,
                    backoffBase: Math.pow(backoffBase, backoffExponent),
                    backoffExponent,
                    disableTimeoutRetry
                }));
        } else {
            return Promise.reject(error);
        }
    });

module.exports = backoff;

