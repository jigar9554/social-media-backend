const { validationResult } = require('express-validator')

const helpers = require('../../helpers/index')
const notification = require('./notification.controller')

const notificationController = new notification()

module.exports = function (app) {
  app.prefix('/user', function (app) {
    app.get('/getNotification/:id', helpers.Authorize.checkUserAuth, function (req, res, next) {
      notificationController.getNotificationList(req, res, next);
    });
    app.get('/readNotification/:id', helpers.Authorize.checkUserAuth, function (req, res, next) {
      notificationController.readNotification(req, res, next);
    });
  })
}