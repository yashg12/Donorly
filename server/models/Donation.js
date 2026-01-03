const mongoose = require('mongoose');

const { Schema } = mongoose;

const DonationSchema = new Schema({
	// Allow any string for itemType (e.g., 'DONATE_FOOD', 'REQUEST_BLOOD')
	itemType: {
		type: String,
		required: true,
	},
	description: {
		type: String,
	},
	quantity: {
		type: String,
	},
	contactPhone: {
		type: String,
	},
	imageUrl: {
		type: String,
		required: false,
	},
	postedBy: { type: String, required: true },
	createdAt: {
		type: Date,
		default: Date.now,
	},
	location: {
		type: {
			type: String,
			enum: ['Point'],
			default: 'Point',
		},
		coordinates: {
			type: [Number],
			// GeoJSON expects [longitude, latitude]
			required: true,
		},
	},
});

// Geospatial index for GeoJSON Point
DonationSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Donation', DonationSchema);

