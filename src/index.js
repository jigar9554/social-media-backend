const express = require('express');
const i18n = require('i18n');
const path = require('path');
const http = require('http');
const config = require('config');
const bodyParser = require('body-parser');
const cors = require('cors');

const helpers = require('./helpers/index');

// init i18n
i18n.configure({
  locales: ['en', 'de'],
  defaultLocale: 'en',
  directory: path.join(__dirname, 'locales'),
  objectNotation: true,
});

// prefix route
express.application.prefix = express.Router.prefix = function (path, configure) {
  var router = express.Router();
  this.use(path, router);
  configure(router);
  return router;
};
// console.log(express.Router.prefix);

const app = express();

app.use('/uploads', express.static('uploads'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

app.use(cors({ origin: (origin, callback) => callback(null, true), credentials: true }));

// set up i18n
app.use(i18n.init);

// admin api routes
// user api routes
require('./user/user/user.router')(app);
require('./user/friendRequest/friendRequest.router')(app);

app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});

// start server
const port = config.get('www.port') || 4000;
app.set('port', port);
const server = http.createServer(app);

server.listen(port, () => console.log('Server listening on port ' + port));

helpers.Socket.socketConnection(server);