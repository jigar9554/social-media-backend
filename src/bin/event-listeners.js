const { debug, error } = require('../helpers/logger');

exports.onError = function (message = '') {
  error.error(message);
  // Logger.error(new Error("Something went wrong!"));
};

exports.onDebug = function (message = '') {
  debug.info(message);
  // debug.info(message, {
  //   meta: '1'
  // });
};