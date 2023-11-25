const { check, param } = require('express-validator');
const bcrypt = require('bcryptjs');
const db = require('../../helpers/db')

exports.validate = (method) => {
  switch (method) {
    case 'createUser': {
      return [
        check('firstName', "Please enter first name").exists(),
        check('lastName', "Please enter last name").exists(),
        check('email', 'Please enter email').exists()
          .isEmail()
          .custom(email => {
            return db.User.findOne({ email }).then(user => {
              if (user) {
                return Promise.reject('E-mail already in use. Please enter different email.')
              }
            })
          }),
        check('mobile', 'Please enter phone number').exists()
          .custom(mobile => {
            return db.User.findOne({ mobile }).then(user => {
              if (user) {
                return Promise.reject('Mobile number already in use. Please enter different mobile number.')
              }
            })
          }),
        check('password', 'Please enter password').exists()
      ]
    }
    case 'loginUser': {
      return [
        check('email', 'Please enter email').exists()
          // .isEmail()
          .custom(email => {
            return db.User.findOne({
              $or: [{
                email: email
              }, {
                mobile: email
              }]
            })
              .then(user => {
                if (!user) {
                  return Promise.reject('Entered email id or mobile number doesn\'t match any account')
                }
              })
          }),
        check('password', 'Please enter password').exists()
          .custom((password, { req }) => {
            return db.User.findOne({
              $or: [{
                email: req.body.email
              }, {
                mobile: req.body.email
              }]
            })
              .then(async (user) => {
                if (!await bcrypt.compare(password, user.password)) {
                  return Promise.reject("The password that you\'ve entered is incorrect");
                }
              })
          })
      ]
    }
    case 'updateProfile': {
      return [
        check('firstName', "Please enter first name").exists(),
        check('lastName', "Please enter last name").exists(),
        check('email', 'Please enter email').exists()
          .isEmail()
          .custom((email, {req})=> {
            return db.User.findOne({ email, "_id": { $ne: req.params.id } }).then(user => {
              if (user) {
                return Promise.reject('E-mail already in use. Please enter different email.')
              }
            })
          }),
        check('mobile', 'Please enter phone number').exists()
          .custom((mobile, {req}) => {
            return db.User.findOne({ mobile, "_id": { $ne: req.params.id } }).then(user => {
              if (user) {
                return Promise.reject('Mobile number already in use. Please enter different mobile number.')
              }
            })
          }),
      ]
    }
    case 'followRequest': {
      return [
        check('from_id', 'From user id is not available').exists()
          .custom((from_id, {req})=> {
            console.log(from_id);
            console.log(req.body.to_id);
            return db.UserFollowRequest.findOne({ from_id, to_id: req.body.to_id }).then(followRequest => {
              console.log("followRequest >>" + followRequest);
              if (followRequest) {
                return Promise.reject('You have already send follow request to this user')
              }
            })
          }),
        check('to_id', 'From user id is not available').exists()
      ]
    }
  }
}