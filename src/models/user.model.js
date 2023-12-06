const mongoose = require('mongoose');
const config = require('config')
// const Schema = mongoose.Schema;

const schema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    userName: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    mobile: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    profileImage: { type: String, required: false },
    role: { type: String, required: true },
    verified: Date,
    is_online: { type: Boolean, default: false },
    resetToken: {
        token: String,
        expires: Date
    },
    passwordReset: Date,
    created: { type: Date, default: Date.now },
    updated: Date
});

schema.virtual('isVerified').get(function () {
    // return !!(this.verified || this.passwordReset);
    return !!(this.verified);
});

schema.virtual('profileUrl').get(function () {
    return (this.profileImage) ? config.get('app.webAppRoot') +'/'+ this.profileImage : config.get('app.webAppRoot') +'/uploads/maleAvatar.JPG';
});

schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        // remove these props when object is serialized
        delete ret._id;
        delete ret.password;
    }
});

schema.set('toObject', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        // remove these props when object is serialized
        delete ret._id;
        delete ret.password;
    }
});

module.exports = mongoose.model('User', schema);