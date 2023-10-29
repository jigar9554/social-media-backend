const Logger = require('./logger');
const Response = require('./response');
const Authorize = require('./middlewares/authorize');
const db = require('./db');
const role = require('./role');
const Socket = require('./socket');

module.exports = {
  Logger,
  response: new Response(),
  Authorize,
  db,
  role,
  Socket
};
