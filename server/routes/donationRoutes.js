const express = require('express');
const Donation = require('../models/Donation');
const User = require('../models/User');

const router = express.Router();

// POST /add - create a donation/request; attach postedBy from userEmail
router.post('/add', async (req, res) => {
	try {
		// Debug incoming payload
		console.log('POST /add req.body:', req.body);
		const { itemType, description, contactPhone, userEmail, location, imageUrl } = req.body || {};

		if (!itemType) {
			return res.status(400).json({ error: 'itemType is required' });
		}
		if (!location || !Array.isArray(location.coordinates)) {
			return res.status(400).json({ message: 'itemType and location.coordinates are required' });
		}
		if (!userEmail) {
			return res.status(400).json({ message: 'User email is required' });
		}

		const newDonation = new Donation({
			itemType,
			description,
			contactPhone,
			imageUrl: typeof imageUrl === 'string' && imageUrl.trim() ? imageUrl.trim() : undefined,
			location,
			postedBy: userEmail,
		});

		const saved = await newDonation.save();
		return res.status(201).json(saved);
	} catch (err) {
		return res.status(500).json({ error: 'Failed to create donation', details: err.message });
	}
});

// GET /nearby?lat=..&lng=.. - Find donations within 10km
router.get('/nearby', async (req, res) => {
	try {
		const q = req.query || {};
		const latNum = parseFloat(q.lat);
		const lngNum = parseFloat(q.lng);
		const radiusNum = q.radius ? parseFloat(q.radius) : 10000; // default 10km
		if (Number.isNaN(latNum) || Number.isNaN(lngNum)) {
			return res.status(400).json({ error: 'Valid lat and lng query params are required' });
		}
		const maxDistance = Number.isNaN(radiusNum) ? 10000 : Math.min(Math.max(radiusNum, 1000), 100000);

		const donations = await Donation.find({
			location: {
				$near: {
					$geometry: { type: 'Point', coordinates: [lngNum, latNum] },
					$maxDistance: maxDistance,
					$minDistance: 0,
				},
			},
		});

		return res.json(donations);
	} catch (err) {
		return res.status(500).json({ error: 'Failed to fetch nearby donations', details: err.message });
	}
});

// GET /my-posts - fetch all donations by postedBy (email), sorted desc by createdAt
router.get('/my-posts', async (req, res) => {
	try {
		const email = (req.query && req.query.email) || '';
		if (!email) {
			return res.status(400).json({ error: 'email query param is required' });
		}

		const posts = await Donation.find({ postedBy: email.trim() }).sort({ createdAt: -1 });
		return res.json(posts);
	} catch (err) {
		return res.status(500).json({ error: 'Failed to fetch posts', details: err.message });
	}
});

// POST /complete/:id - Mark donation as fulfilled, increment user's impact score by 10, then delete
router.post('/complete/:id', async (req, res) => {
	try {
		const id = req.params && req.params.id;
		if (!id) {
			return res.status(400).json({ error: 'id param is required' });
		}

		// Find the donation
		const donation = await Donation.findById(id);
		if (!donation) {
			return res.status(404).json({ error: 'Donation not found' });
		}

		// Find the user who posted it and increment their impact score
		const user = await User.findOneAndUpdate(
			{ email: donation.postedBy },
			{ $inc: { impactScore: 10 } },
			{ new: true } // Return the updated document
		);

		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}

		// Delete the donation after marking as complete
		await Donation.findByIdAndDelete(id);

		return res.json({ 
			message: 'Donation marked as fulfilled! +10 Impact Score! 🎉', 
			newScore: user.impactScore,
			id 
		});
	} catch (err) {
		return res.status(500).json({ error: 'Failed to complete donation', details: err.message });
	}
});

// DELETE /:id - Delete a donation by ID
router.delete('/:id', async (req, res) => {
	try {
		const id = req.params && req.params.id;
		if (!id) {
			return res.status(400).json({ error: 'id param is required' });
		}

		const result = await Donation.findByIdAndDelete(id);
		if (!result) {
			return res.status(404).json({ error: 'Donation not found' });
		}

		return res.json({ message: 'Deleted successfully', id });
	} catch (err) {
		return res.status(500).json({ error: 'Failed to delete donation', details: err.message });
	}
});

module.exports = router;

