const listeners = require('../../bin/event-listeners')
const helpers = require('../../helpers/index')

module.exports = class UserController {
  async getUserList(req, res, next) {
    helpers.db.UserFollowRequest
      .find({
        "to_id": new helpers.db.ObjectId(req.userData.sub),
        "acceptStatus": true
      })
      .populate('from_id',  'firstName lastName is_online')
      // .where('acceptStatus').equals(true)
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
        listeners.onError("Get friend list in chat")
        listeners.onError(err)
        listeners.onError("<<< >>>")
        res.status(500).json({
          error: err
        })
      });
  }

  async sendMessage(req, res, next) {
    const sendMessage = new helpers.db.Chat(req.body)
    await sendMessage.save()
      .then((result) => {
        res.status(200).json(
          helpers.response.success({
            msg: 'Message send successfully',
            data: result
          })
        )
      })
      .catch((err) => {
        listeners.onError("Send Message")
        listeners.onError(err)
        listeners.onError("<<< >>>")
        res.status(500).json({
          error: err
        })
      });
  }

  async getMessage(req, res, next) {
    helpers.db.Chat
      .find()
      .or([
        { 
          "from_id": new helpers.db.ObjectId(req.userData.sub),
          "to_id": new helpers.db.ObjectId(req.params.id)
        }, 
        { 
          "to_id": new helpers.db.ObjectId(req.userData.sub),
          "from_id": new helpers.db.ObjectId(req.params.id)
        }
      ])
      // .find({
      //   "from_id": new helpers.db.ObjectId(req.userData.sub),
      //   "to_id": new helpers.db.ObjectId(req.params.id)
      // })
      .populate('from_id',  'firstName lastName')
      .populate('to_id',  'firstName lastName')
      .exec()
      .then((result) => {
        res.status(200).json(
          helpers.response.success({
            msg: 'Chat messages',
            data: result
          })
        )
      })
      .catch((err) => {
        listeners.onError("Get chat messages")
        listeners.onError(err)
        listeners.onError("<<< >>>")
        res.status(500).json({
          error: err
        })
      });
  }
}