const mongoose = require('mongoose');

const { Schema } = mongoose;

const FeedbackSchema = new Schema({
	userEmail: {
		type: String,
		required: true,
		trim: true,
		lowercase: true,
	},
	userName: {
		type: String,
		trim: true,
	},
	rating: {
		type: Number,
		required: true,
		min: 1,
		max: 5,
	},
	message: {
		type: String,
		required: true,
		trim: true,
		maxlength: 1000,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

module.exports = mongoose.model('Feedback', FeedbackSchema);
