const withTM = require('next-transpile-modules')(['@hapi']); // pass the modules you would like to see transpiled

module.exports = withTM();
