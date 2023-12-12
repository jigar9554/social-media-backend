const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const config = require('config')
const listeners = require('../../bin/event-listeners')
const helpers = require('../../helpers/index')
// const Role = require('../../helpers/role')
// const db = require('../../helpers/db')

module.exports = class UserController {
  async register(req, res, next) {
    // create account object
    const user = new helpers.db.User(req.body)
    // first registered account is an admin
    const isFirstAccount = (await helpers.db.User.countDocuments({})) === 0
    user.role = isFirstAccount ? helpers.role.Admin : helpers.role.User
    user.password = UserController.hash(req.body.password)
    user.userName = "Test"
    console.log(user);
    await user.save()
      .then((userData) => {
        res.status(200).json(
          helpers.response.success({
            msg: 'Registration successful, please check your email for verification instructions',
            data: userData
          })
        )
      }).catch((error) => {
        return res.status(422).json(
          helpers.response.error({ msg: error, field: null })
        )
      })

    // send email
    // await sendVerificationEmail(account, origin)
  }

  async login(req, res, next) {
    try {
      const user = await helpers.db.User.findOne({ $or: [{ email: req.body.email }, { mobile: req.body.email }] })
      helpers.db.User.updateOne({
        _id: new helpers.db.ObjectId(user._id)
      }, { $set: { is_online: true } })
      .exec()

      const token = jwt.sign({ sub: user._id }, config.get('accounts.jwt.key'), { expiresIn: config.get('accounts.jwt.exp') })
      res.status(200).json(
        helpers.response.success({
          msg: 'Login successfully',
          data: {
            "userData": user.toJSON(),
            "token": token
          },
        })
      )
    } catch (error) {
      listeners.onError(error)
      return res.status(500).json(
        helpers.response.error({ msg: "Something went wrong!", field: null })
      )
    }
  }

  async logOut(req, res, next) {
    try {
      helpers.db.User.updateOne({
        _id: new helpers.db.ObjectId(req.body.id)
      }, { $set: { is_online: false } })
      .exec()
      res.status(200).json(
        helpers.response.success({
          msg: 'Logout successfully',
          data: null
        })
      )
    } catch (error) {
      listeners.onError(error)
      return res.status(500).json(
        helpers.response.error({ msg: "Something went wrong!", field: null })
      )
    }
  }

  async getUserList(req, res, next) {
        helpers.db.User
      .aggregate([
        // First Way
        // { $match: 
        //   {
        //     'role': 'User', 
        //     $expr : {
        //       $ne: [ '$_id' , { $toObjectId: "65068f808cb9d33b5c1d2eb0" } ]
        //     } 
        //   } 
        // },

        // Second Way
        {
          $match:
          {
            'role': 'User', "_id": { $ne: new helpers.db.ObjectId(req.userData.sub) }
          }
        },
        {
          $lookup: {
            from: "user_follow_requests",
            // localField: "_id",
            // foreignField: "to_id",
            let: { userId: "$_id" },
            pipeline: [{
              $match: {
                $expr: {
                  $or: [
                    {
                      $and:[
                        { $eq: [new helpers.db.ObjectId(req.userData.sub), "$from_id"] },
                        { $eq: ["$$userId", "$to_id"] }
                      ]
                    },
                    {
                      $and:[
                        { $eq: [new helpers.db.ObjectId(req.userData.sub), "$to_id"] },
                        { $eq: ["$$userId", "$from_id"] }
                      ]
                    }
                  ]
                }
              }
            }],
            as: "follow"
          }
        },
        // {
        //   $lookup: {
        //     from: "user_follow_requests",
        //     let: { userId: "$_id" },
        //     pipeline: [{
        //       $match: {
        //         $expr: {
        //           $and: [
        //             { $eq: [new helpers.db.ObjectId(req.userData.sub), "$to_id"] },
        //             { $eq: ["$$userId", "$from_id"] }
        //           ]
        //         }
        //       }
        //     }],
        //     as: "follow"
        //   }
        // },
        {
          $unwind: {
            path: "$follow",
            preserveNullAndEmptyArrays: true
          }
        },
        // {
        //   $unwind: {
        //     path: "$following",
        //     preserveNullAndEmptyArrays: true
        //   }
        // },
        { 
          $project : { 
            "_id": 1,
            "firstName": 1,
            "lastName": 1,
            "email": 1,
            "mobile": 1,
            "password": 1,
            "role": 1,
            "created": 1,
            "userName": 1,
            "profileImage": 1,
            'isSender': {
                $cond: [
                  { $and: [
                    { $ifNull: ["$follow", null] }
                  ]},
                  { $cond: [
                    {$eq: ["$follow.from_id", new helpers.db.ObjectId(req.userData.sub)]},
                    true,
                    false
                  ]},
                  null
                ]  
            },
            // "isFollow": {
            //   // $ifNull: ["$follow.acceptStatus", false]
            //   $cond: [
            //     { $and: [
            //       { $ifNull: ["$follow", null] }
            //     ]},
            //     { $cond: [
            //       {$eq: ["$follow.acceptStatus", true]},
            //       true,
            //       false
            //     ]},
            //     null
            //   ]
            // },
            "followRequest": {
              // "$arrayElemAt": ["$follow", 0]
              $ifNull: ["$follow", null],
            },
            // "isFollowing": {
            //   // $ifNull: ["$following.acceptStatus", false]
            //   $cond: [
            //     { $and: [
            //       { $ifNull: ["$following", null] }
            //     ]},
            //     { $cond: [
            //       {$eq: ["$following.acceptStatus", true]},
            //       true,
            //       false
            //     ]},
            //     null
            //   ]
            // },
            // "following": {
            //   $ifNull: ["$following", {}],
            //   // "$arrayElemAt": ["$following", 0]
            // }
          }
        }
        // {
        //   "$set": {
        //     "profileImage": {
        //       "$concat": [
        //         "http://localhost:4000",
        //         "$profileImage"
        //       ]
        //     }
        //   }
        // }
      ])
      .exec()
      .then((result) => {
        res.status(200).json(
          helpers.response.success({
            msg: 'User profile detail successfully updated',
            data: result
          })
        )
      })
      .catch((err) => {
        listeners.onError("User >> Get User List")
        listeners.onError(err)
        listeners.onError("<<< >>>")
        res.status(500).json({
          error: err
        })
      });
  }

  async updateProfileDetail(req, res, next) {
    helpers.db.User.updateOne({
      _id: req.params.id
    }, { $set: { firstName: req.body.firstName, lastName: req.body.lastName, email: req.body.email, mobile: req.body.mobile } })
      .exec()
      .then(async (result) => {
        let updatedUserData = await UserController.getUserById(req.params.id)
        res.status(200).json(
          helpers.response.success({
            msg: 'User profile detail successfully updated',
            data: {
              "userData": updatedUserData.toJSON()
            }
          })
        )
      })
      .catch((err) => {
        listeners.onError("User >> Update user update Profile Detail")
        listeners.onError(err)
        listeners.onError("<<< >>>")
        res.status(500).json({
          error: err
        })
      });
  }

  async updateProfileImage(req, res, next) {
    helpers.db.User.updateOne({
      _id: new helpers.db.ObjectId(req.params.id)
    }, { $set: { profileImage: req.file.path } })
      .exec()
      .then(async (result) => {
        let updatedUserData = await UserController.getUserById(req.params.id)
        res.status(200).json(
          helpers.response.success({
            msg: 'User profile image successfully updated',
            data: {
              "userData": updatedUserData.toJSON()
            }
          })
        )
      })
      .catch((err) => {
        listeners.onError("User >> Update user profile")
        listeners.onError(err)
        listeners.onError("<<< >>>")
        res.status(500).json({
          error: err
        })
      });
  }

  static hash(password) {
    return bcrypt.hashSync(password, 10)
  }

  static getUserById(id) {
    return helpers.db.User.findById(id)
  }

  static getUserByEmail(email) {
    // get user by email
  }

  static omitHash(user) {
    const { password, ...userWithoutHash } = user
    return userWithoutHash
  }
}