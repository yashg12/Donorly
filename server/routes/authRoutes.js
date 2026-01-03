const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// POST /register
router.post('/register', async (req, res) => {
	try {
		const { name, email, password, phone } = req.body || {};
		if (!name || !email || !password) {
			return res.status(400).json({ error: 'name, email, and password are required' });
		}

		const existing = await User.findOne({ email: email.toLowerCase().trim() });
		if (existing) {
			return res.status(409).json({ error: 'User already exists' });
		}

		const saltRounds = 10;
		const hashed = await bcrypt.hash(password, saltRounds);

		const user = await User.create({
			name: name.trim(),
			email: email.toLowerCase().trim(),
			password: hashed,
			phone: phone?.trim(),
		});

		return res.status(201).json({ message: 'Registration successful', user: {
			id: user._id,
			name: user.name,
			email: user.email,
			role: user.role,
			phone: user.phone,
		}});
	} catch (err) {
		return res.status(500).json({ error: 'Registration failed', details: err.message });
	}
});

// POST /login
router.post('/login', async (req, res) => {
	try {
		const { email, password } = req.body || {};
		if (!email || !password) {
			return res.status(400).json({ error: 'email and password are required' });
		}

		const user = await User.findOne({ email: email.toLowerCase().trim() });
		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}

		const match = await bcrypt.compare(password, user.password);
		if (!match) {
			return res.status(401).json({ error: 'Invalid credentials' });
		}

		const payload = { userId: user._id, name: user.name, role: user.role };
		const jwtSecret = process.env.JWT_SECRET;
		if (!jwtSecret) {
			return res.status(500).json({
				error: 'Server is not configured for authentication (missing JWT_SECRET)',
			});
		}
		const token = jwt.sign(payload, jwtSecret, { expiresIn: '7d' });

		return res.json({
			token,
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
				phone: user.phone,
			},
		});
	} catch (err) {
		return res.status(500).json({ error: 'Login failed', details: err.message });
	}
});

// GET /user?email=... - Get user data including impact score
router.get('/user', async (req, res) => {
	try {
		const email = (req.query && req.query.email) || '';
		if (!email) {
			return res.status(400).json({ error: 'email query param is required' });
		}

		const user = await User.findOne({ email: email.toLowerCase().trim() });
		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}

		return res.json({
			id: user._id,
			name: user.name,
			email: user.email,
			role: user.role,
			phone: user.phone,
			impactScore: user.impactScore || 0,
		});
	} catch (err) {
		return res.status(500).json({ error: 'Failed to fetch user', details: err.message });
	}
});

module.exports = router;

