const mongoose = require('mongoose');
const config = require('config')
const Schema = mongoose.Schema;

const schema = new mongoose.Schema({
    from_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false
    },
    to_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false
    },
    status: { type: Boolean, default: 0 },
    notification_type: { type: String, required: true },
    notification_message: { type: String, required: true },
    created: { type: Date, default: Date.now },
    updated: Date
});

module.exports = mongoose.model('notifications', schema);