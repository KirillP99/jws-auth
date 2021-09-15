const { Schema, model } = require('mongoose');

const UserSchema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isActivated: { type: Boolean, default: false },
    activationLink: { type: String },
}); // describe mongo schema

module.exports = model('User', UserSchema); // export model User
