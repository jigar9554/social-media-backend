const helpers = require('../../helpers/index')
const usersRequest = require('./friendRequest.controller')
const userRequestRules = require('./friendRequest.rules')

const usersRequestController = new usersRequest()

module.exports = function (app) {
  app.prefix('/user', function (app) {
    app.get('/get-request', helpers.Authorize.checkUserAuth, function (req, res, next) {
      usersRequestController.getRequestList(req, res, next);
    });

    app.post('/accept-reject-follow-request', helpers.Authorize.checkUserAuth, function (req, res, next) {
      usersRequestController.acceptFollowRequest(req, res, next);
    })
  })
}