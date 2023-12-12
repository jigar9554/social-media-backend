const { validationResult } = require('express-validator')

const helpers = require('../../helpers/index')
const usersRequest = require('./friendRequest.controller')
const userRequestRules = require('./friendRequest.rules')

const usersRequestController = new usersRequest()

module.exports = function (app) {
  app.prefix('/user', function (app) {
    app.get('/get-request', helpers.Authorize.checkUserAuth, function (req, res, next) {
      usersRequestController.getRequestList(req, res, next);
    });

    app.post('/user-follow-request', helpers.Authorize.checkUserAuth, userRequestRules.validate('followRequest'), function (req, res, next) {
      const errors = validationResult(req)
      
      if (!errors.isEmpty()) {
        const error = errors.array()[0]
        return res.status(422).json(
          helpers.response.error({ msg: error.msg, field: error.param })
        )
      }
      usersRequestController.followRequest(req, res, next)
    })
    
    app.post('/accept-reject-follow-request', helpers.Authorize.checkUserAuth, function (req, res, next) {
      usersRequestController.acceptFollowRequest(req, res, next);
    })
    
    app.post('/accept-reject-follow-back-request', helpers.Authorize.checkUserAuth, function (req, res, next) {
      usersRequestController.acceptFollowBackRequest(req, res, next);
    })
    
    app.post('/follow-back-request', helpers.Authorize.checkUserAuth, function (req, res, next) {
      usersRequestController.followBack(req, res, next);
    })
  })
}