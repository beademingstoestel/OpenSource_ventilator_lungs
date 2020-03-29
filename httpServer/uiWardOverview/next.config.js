const path = require('path');
const withTM = require('next-transpile-modules')(['@hapi', 'ventilator-lungs-ui']); // pass the modules you would like to see transpiled

module.exports = withTM({
    // An example of how to differentiate between dev and production environments:
    // https://github.com/zeit/next.js/blob/canary/examples/with-env-from-next-config-js/next.config.js
    env: {
        dbProtocol: 'http',
        dbPort: '3001',
    },
    webpack: (config) => {
        config.resolve.alias['react'] = path.resolve(__dirname, '.', 'node_modules', 'react');
        config.resolve.alias['react-dom'] = path.resolve(__dirname, '.', 'node_modules', 'react-dom');
        config.resolve.alias['next'] = path.resolve(__dirname, '.', 'node_modules', 'next');
        config.resolve.alias['classnames'] = path.resolve(__dirname, '.', 'node_modules', 'classnames');

        return config
      },
});
