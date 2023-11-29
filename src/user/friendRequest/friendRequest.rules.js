const { check, param } = require('express-validator');
const bcrypt = require('bcryptjs');
const db = require('../../helpers/db')

exports.validate = (method) => {
    switch (method) {
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