const express = require('express');
const Feedback = require('../models/Feedback');

const router = express.Router();

// POST /submit - Submit user feedback
router.post('/submit', async (req, res) => {
	try {
		const { userEmail, userName, rating, message } = req.body || {};

		if (!userEmail || !rating || !message) {
			return res.status(400).json({ error: 'userEmail, rating, and message are required' });
		}

		if (rating < 1 || rating > 5) {
			return res.status(400).json({ error: 'Rating must be between 1 and 5' });
		}

		if (message.length > 1000) {
			return res.status(400).json({ error: 'Message must be less than 1000 characters' });
		}

		const newFeedback = new Feedback({
			userEmail: userEmail.trim().toLowerCase(),
			userName: userName?.trim() || 'Anonymous',
			rating,
			message: message.trim(),
		});

		await newFeedback.save();

		return res.status(201).json({ 
			message: 'Thank you for your feedback! We appreciate it. 💚',
			success: true
		});
	} catch (err) {
		return res.status(500).json({ error: 'Failed to submit feedback', details: err.message });
	}
});

module.exports = router;
