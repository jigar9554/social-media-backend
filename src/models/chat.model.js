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
    message: { type: String, required: true },
    is_read: { type: Boolean, default: 0 },
    created: { type: Date, default: Date.now },
    updated: Date
});

module.exports = mongoose.model('chats', schema);