const DEV_CONFIG = require('./dev');

module.exports = function () {
  switch (process.env.NODE_ENV) {
    case 'development':
      return DEV_CONFIG;
    default:
      return DEV_CONFIG;
  }
};
