const listeners = require('../../bin/event-listeners')
const helpers = require('../../helpers/index')

module.exports = class UserController {
  async getNotificationList(req, res, next) {
    helpers.db.Notification
      .find({
        "to_id": new helpers.db.ObjectId(req.userData.sub),
        "status": false
      })
      .populate('from_id',  'firstName lastName')
      .exec()
      .then((result) => {
        res.status(200).json(
          helpers.response.success({
            msg: 'Notification',
            data: result
          })
        )
      })
      .catch((err) => {
        listeners.onError("User Notification >> Get List")
        listeners.onError(err)
        listeners.onError("<<< >>>")
        res.status(500).json({
          error: err
        })
      });    
  }

  async readNotification(req, res, next) {
    helpers.db.Notification.updateMany({
      "to_id": new helpers.db.ObjectId(req.userData.sub),
      "status": false
    }, {
      "status": true
    })
    .exec()
    .then(async (result) => {
      res.status(200).json(
        helpers.response.success({
          msg: 'Notification read successfully',
          data: null
        })
      )
    })
    .catch((err) => {
      listeners.onError("Notification >> Read Notification")
      listeners.onError(err)
      listeners.onError("<<< >>>")
      res.status(500).json({
        error: err
      })
    });
  }
}