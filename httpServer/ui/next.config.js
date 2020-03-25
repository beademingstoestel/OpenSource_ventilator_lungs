const withTM = require('next-transpile-modules')(['@hapi']); // pass the modules you would like to see transpiled

module.exports = withTM({
    // An example of how to differentiate between dev and production environments:
    // https://github.com/zeit/next.js/blob/canary/examples/with-env-from-next-config-js/next.config.js
    env: {
        apiURL: 'localhost:3001',
    },
});
