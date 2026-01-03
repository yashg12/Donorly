const mongoose = require('mongoose');

const { Schema } = mongoose;

const SuccessStorySchema = new Schema({
	userEmail: {
		type: String,
		required: true,
		trim: true,
		lowercase: true,
	},
	userName: {
		type: String,
		required: true,
		trim: true,
	},
	itemType: {
		type: String,
		required: true,
		trim: true,
	},
	story: {
		type: String,
		required: true,
		trim: true,
		maxlength: 500,
	},
	impactScore: {
		type: Number,
		default: 10,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

module.exports = mongoose.model('SuccessStory', SuccessStorySchema);
