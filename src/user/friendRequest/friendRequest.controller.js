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

  async followRequest(req, res, next) {
    const userRequest = new helpers.db.UserFollowRequest(req.body)
    await userRequest.save()
      .then(async (userRequestData) => {
        await new helpers.db.Notification({
          from_id: req.body.from_id,
          to_id: req.body.to_id,
          notification_type: "Follow Request",
          notification_message: "You get new follow request!"
        }).save();
        res.status(200).json(
          helpers.response.success({
            msg: 'Your follow request has been sent',
            data: null
          })
        )
      }).catch((error) => {
        return res.status(500).json(
          helpers.response.error({ msg: error, field: null })
        )
      })
  }
  
  async acceptFollowRequest(req, res, next) {
    if (req.body.status == 0) {
      helpers.db.UserFollowRequest.deleteOne({ _id: new helpers.db.ObjectId(req.body.id) })
        .exec()
        .then((result) => {
          res.status(200).json(
            helpers.response.success({
              msg: 'You have successfully decline user follow request'
            })
          )
        })
        .catch((err) => {
          listeners.onError("User >> Accept or Reject follow request")
          listeners.onError(err)
          listeners.onError("<<< >>>")
          res.status(500).json({
            error: err
          })
        });
    } else {
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
        listeners.onError("User >> Accept or Reject follow request")
        listeners.onError(err)
        listeners.onError("<<< >>>")
        res.status(500).json({
          error: err
        })
      });
    }
  }

  async acceptFollowBackRequest(req, res, next) {
    let status = (req.body.status = 1) ? true : false;
    helpers.db.UserFollowRequest.updateOne({
      _id: req.body.id
    }, { $set: { followBack: status, followBackStatus: status } })
    .exec()
    .then((result) => {
      res.status(200).json(
        helpers.response.success({
          msg: 'You have successfully accept user follow back request'
        })
      )
    })
    .catch((err) => {
      listeners.onError("User >> Accept or Reject follow back request")
      listeners.onError(err)
      listeners.onError("<<< >>>")
      res.status(500).json({
        error: err
      })
    });
  }

  async followBack(req, res, next) {
    helpers.db.UserFollowRequest.updateOne({
      _id: req.body.id
    }, { $set: { followBack: true } })
    .exec()
    .then((result) => {
      res.status(200).json(
        helpers.response.success({
          msg: 'Follow back request sent successfully'
        })
      )
    })
    .catch((err) => {
      listeners.onError("User >> follow back request")
      listeners.onError(err)
      listeners.onError("<<< >>>")
      res.status(500).json({
        error: err
      })
    });
  }
}