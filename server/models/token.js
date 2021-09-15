const { Schema, model } = require('mongoose');

const TokenSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' }, // data refer to User model
    refreshToken: { type: String, required: true },
}); // describe mongo schema

module.exports = model('Token', TokenSchema); // export model User
