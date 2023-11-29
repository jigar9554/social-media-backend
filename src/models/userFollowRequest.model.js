const mongoose = require('mongoose');
const config = require('config')
const Schema = mongoose.Schema;

const schema = new mongoose.Schema({
    from_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    to_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    acceptStatus: { type: Boolean, default: 0 },
    // followBack: { type: Boolean, default: 0 },
    created: { type: Date, default: Date.now },
    updated: Date
});

module.exports = mongoose.model('user_follow_requests', schema);