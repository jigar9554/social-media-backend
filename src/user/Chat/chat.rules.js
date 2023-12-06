const { check, param } = require('express-validator');
const bcrypt = require('bcryptjs');
const db = require('../../helpers/db')

exports.validate = (method) => {
    switch (method) {
        case 'sendMessage': {
            return [
              check('from_id', 'From user id is not available').exists(),
              check('to_id', 'Please select user first').exists(),
              check('message', 'Please enter message').exists()
            ]
        }
    }
}