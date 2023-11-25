const listeners = require('../../bin/event-listeners')
const helpers = require('../../helpers/index')

module.exports = class UserController {
  async getRequestList(req, res, next) {
    helpers.db.UserFollowRequest
      .find({
        "to_id": new helpers.db.ObjectId(req.userData.sub)
      })
      .populate('from_id',  'firstName lastName')
      .exec()
      .then((result) => {
        res.status(200).json(
          helpers.response.success({
            msg: 'Follow request',
            data: result
          })
        )
      })
      .catch((err) => {
        listeners.onError("User Follow Request >> Get List")
        listeners.onError(err)
        listeners.onError("<<< >>>")
        res.status(500).json({
          error: err
        })
      });    
  }

  async acceptFollowRequest(req, res, next) {
    helpers.db.UserFollowRequest.updateOne({
      _id: req.body.id
    }, { $set: { acceptStatus: req.body.status } })
    .exec()
    .then((result) => {
      res.status(200).json(
        helpers.response.success({
          msg: 'You have successfully accept user follow request'
        })
      )
    })
    .catch((err) => {
      listeners.onError("User >> Accept follow request")
      listeners.onError(err)
      listeners.onError("<<< >>>")
      res.status(500).json({
        error: err
      })
    });
  }
}