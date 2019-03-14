const pause = (duration) => new Promise(resolve => setTimeout(resolve, duration));

const backoff = (fn, {max, backoffBase = 100, backoffExponent = 1.1}) =>
    fn().catch(error => {
        if (max > 1) {
            return pause(backoffBase)
                .then(() => backoff(fn, {
                    max: --max,
                    backoffBase: Math.pow(backoffBase, backoffExponent),
                    backoffExponent
                }));
        } else {
            return Promise.reject(error);
        }
    });

module.exports = backoff;