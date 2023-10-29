const mongoose = require('mongoose');
const config = require('config')
const Schema = mongoose.Schema;

const schema = new mongoose.Schema({
    from_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    to_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    status: { type: Boolean, default: 0 },
    created: { type: Date, default: Date.now },
    updated: Date
});

module.exports = mongoose.model('user_follow_requests', schema);