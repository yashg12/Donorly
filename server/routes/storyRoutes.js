const express = require('express');
const SuccessStory = require('../models/SuccessStory');

const router = express.Router();

// POST /save - Save a success story after donation fulfillment
router.post('/save', async (req, res) => {
	try {
		const { userEmail, userName, itemType, story } = req.body || {};

		if (!userEmail || !userName || !itemType || !story) {
			return res.status(400).json({ 
				error: 'userEmail, userName, itemType, and story are required' 
			});
		}

		if (story.length > 500) {
			return res.status(400).json({ error: 'Story must be less than 500 characters' });
		}

		const newStory = new SuccessStory({
			userEmail: userEmail.trim().toLowerCase(),
			userName: userName.trim(),
			itemType: itemType.trim(),
			story: story.trim(),
		});

		await newStory.save();

		return res.status(201).json({ 
			message: 'Your success story has been saved! 💚',
			success: true
		});
	} catch (err) {
		return res.status(500).json({ 
			error: 'Failed to save success story', 
			details: err.message 
		});
	}
});

// GET /stories - Get all success stories for the Impact Feed
router.get('/stories', async (req, res) => {
	try {
		const limit = parseInt(req.query.limit) || 50;
		
		const stories = await SuccessStory.find()
			.sort({ createdAt: -1 })
			.limit(limit);

		return res.json(stories);
	} catch (err) {
		return res.status(500).json({ 
			error: 'Failed to fetch stories', 
			details: err.message 
		});
	}
});

module.exports = router;
