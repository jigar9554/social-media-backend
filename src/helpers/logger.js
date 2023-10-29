const {format, createLogger, transports, winston} = require('winston');
const { combine, timestamp, label, printf } = format;
const path = require('path');

var options = {
  debug: {
    filename: path.join(__dirname, '../../logs/debug.log'),
  },
  error: {
    filename: path.join(__dirname, '../../logs/error.log'),
  }
};

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} ${level}: ${stack || message}`;
});

let debug = createLogger({
  level: 'debug',
  // format: simple(),
  format: combine(
    format.colorize(),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({
      stack: true
    }),
    logFormat
  ),
  defaultMeta: { service: 'user-service' },
  transports: [
    new transports.Console(),
    new transports.File(options.debug)
  ],
});

let error = createLogger({
  level: 'error',
  // format: simple(),
  format: combine(
    format.colorize(),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({
      stack: true
    }),
    logFormat
  ),
  defaultMeta: { service: 'user-service' },
  transports: [
    new transports.Console(),
    new transports.File(options.error)
  ],
});
 
module.exports = {
  debug,
  error
};
