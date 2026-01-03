const express = require('express');
const User = require('./models/User');
const Donation = require('./models/Donation');
const SuccessStory = require('./models/SuccessStory');

const router = express.Router();

// GET /stats - Dashboard statistics
router.get('/stats', async (req, res) => {
	try {
		const totalUsers = await User.countDocuments();
		const totalDonations = await Donation.countDocuments();
		const totalStories = await SuccessStory.countDocuments();

		return res.json({
			totalUsers,
			totalDonations,
			totalStories,
		});
	} catch (err) {
		return res.status(500).json({ error: 'Failed to fetch stats', details: err.message });
	}
});

// GET /feedback - Fetch all success stories (newest first)
router.get('/feedback', async (req, res) => {
	try {
		const stories = await SuccessStory.find()
			.sort({ createdAt: -1 })
			.lean();

		return res.json(stories);
	} catch (err) {
		return res.status(500).json({ error: 'Failed to fetch feedback', details: err.message });
	}
});

// GET /users - list NGOs and USER roles
router.get('/users', async (req, res) => {
	try {
		const users = await User.find({ role: { $in: ['USER', 'NGO'] } })
			.select('name email role isVerified impactScore');
		return res.json(users);
	} catch (err) {
		return res.status(500).json({ error: 'Failed to fetch users', details: err.message });
	}
});

// PUT /users/:id/score - Update user's impact score
router.put('/users/:id/score', async (req, res) => {
	try {
		const { id } = req.params;
		const { impactScore } = req.body || {};

		if (!id) return res.status(400).json({ error: 'User id is required' });
		if (typeof impactScore !== 'number' || impactScore < 0) {
			return res.status(400).json({ error: 'Valid impactScore (number >= 0) is required' });
		}

		const updated = await User.findByIdAndUpdate(
			id,
			{ $set: { impactScore } },
			{ new: true }
		).select('name email role impactScore');

		if (!updated) return res.status(404).json({ error: 'User not found' });
		return res.json({ message: 'Impact score updated', user: updated });
	} catch (err) {
		return res.status(500).json({ error: 'Failed to update score', details: err.message });
	}
});

// PUT /verify/:id - mark a user as verified
router.put('/verify/:id', async (req, res) => {
	try {
		const { id } = req.params;
		if (!id) return res.status(400).json({ error: 'User id is required' });

		const { isVerified } = req.body || {};
		if (typeof isVerified !== 'boolean') {
			return res.status(400).json({ error: 'isVerified boolean is required in body' });
		}

		const updated = await User.findByIdAndUpdate(
			id,
			{ $set: { isVerified } },
			{ new: true }
		).select('name email role isVerified');

		if (!updated) return res.status(404).json({ error: 'User not found' });
		return res.json({ message: 'User verification updated', user: updated });
	} catch (err) {
		return res.status(500).json({ error: 'Failed to update verification', details: err.message });
	}
});

// DELETE /feedback/:id - Delete a success story (moderation)
router.delete('/feedback/:id', async (req, res) => {
	try {
		const { id } = req.params;
		if (!id) return res.status(400).json({ error: 'Feedback id is required' });

		const deleted = await SuccessStory.findByIdAndDelete(id);
		if (!deleted) return res.status(404).json({ error: 'Feedback not found' });

		return res.json({ message: 'Feedback deleted successfully' });
	} catch (err) {
		return res.status(500).json({ error: 'Failed to delete feedback', details: err.message });
	}
});

module.exports = router;
