const { validationResult } = require('express-validator')

const helpers = require('../../helpers/index')
const chat = require('./chat.controller')
const chatRules = require('./chat.rules')

const chatController = new chat()

module.exports = function (app) {
  app.prefix('/user/chat', function (app) {
    app.get('/get-friends', helpers.Authorize.checkUserAuth, function (req, res, next) {
      chatController.getUserList(req, res, next);
    });

    app.get('/get-messages/:id', helpers.Authorize.checkUserAuth, function (req, res, next) {
      chatController.getMessage(req, res, next);
    });

    app.post('/send-message', helpers.Authorize.checkUserAuth, chatRules.validate('sendMessage'), function (req, res, next) {
      const errors = validationResult(req)
      
      if (!errors.isEmpty()) {
        const error = errors.array()[0]
        return res.status(422).json(
          helpers.response.error({ msg: error.msg, field: error.param })
        )
      }

      chatController.sendMessage(req, res, next);
    });

    // app.post('/read-message', helpers.Authorize.checkUserAuth, function (req, res, next) {
    //   chatController.readMessage(req, res, next);
    // });
  })
}