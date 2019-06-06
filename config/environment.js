'use strict';

module.exports = function(environment) {
  let ENV = {
    modulePrefix: 'async-data-demo',
    environment,
    rootURL: '/',
    locationType: 'hash',
  };

  return ENV;
};
