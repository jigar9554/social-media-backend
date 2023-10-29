const listeners = require('../../bin/event-listeners');
const jwt = require('jsonwebtoken');
const config = require('config');

function getTokenFromHeaders(headers) {
  const header = headers.authorization;
  if (!header)
    return header

  return header
}

let checkUserAuth = (req, res, next) => {
  try {
    let headerToken = getTokenFromHeaders(req.headers) || req.query.token || req.body.token || '';
    req.userData = jwt.verify(headerToken.split(" ")[1], config.get('accounts.jwt.key'));
    next();
  } catch (error) {
    listeners.onError(error);
    return res.status(401).json({
      message: 'Unauthorized'
    })
  }
}

module.exports = {
  checkUserAuth
}