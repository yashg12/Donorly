const mongoose = require('mongoose');

const { Schema } = mongoose;

const OrganizationDetailsSchema = new Schema(
	{
		registrationNumber: {
			type: String,
			trim: true,
		},
		address: {
			type: String,
			trim: true,
		},
	},
	{ _id: false }
);

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
		enum: ['user', 'ngo', 'admin'],
		default: 'user',
		required: true,
	},
	organizationDetails: {
		type: OrganizationDetailsSchema,
		required: false,
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

