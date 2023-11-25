const config = require('config');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const connectionOptions = { useNewUrlParser: true, useUnifiedTopology: true};
console.log("config.get('mongoDb.uri') >>", connectionOptions);
mongoose.connect(config.get('mongoDb.uri'), connectionOptions);
mongoose.Promise = global.Promise;

module.exports = {
    User: require('../models/user.model'),
    UserFollowRequest: require('../models/userFollowRequest.model'),
    Notification: require('../models/notification.model'),
    // RefreshToken: require('accounts/refresh-token.model'),
    isValidId,
    ObjectId
};

function isValidId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}