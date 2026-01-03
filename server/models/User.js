const mongoose = require('mongoose');

const { Schema } = mongoose;

const UserSchema = new Schema({
	name: {
		type: String,
		required: true,
		trim: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
		trim: true,
		lowercase: true,
	},
	password: {
		type: String,
		required: true,
	},
	role: {
		type: String,
		enum: ['USER', 'ADMIN', 'NGO'],
		default: 'USER',
		required: true,
	},
	phone: {
		type: String,
		trim: true,
	},
	isVerified: {
		type: Boolean,
		default: false,
	},
	impactScore: {
		type: Number,
		default: 0,
	},
});

module.exports = mongoose.model('User', UserSchema);

