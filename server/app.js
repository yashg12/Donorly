const donationRoutes = require('./routes/donationRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./adminRoutes');
const aiRoutes = require('./routes/aiRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const storyRoutes = require('./routes/storyRoutes');
const express = require('express');
const cors = require('cors');

const { requireAuth, requireAdmin } = require('./middleware/auth');

function buildAllowedOrigins() {
	const allowed = new Set();

	// Local dev
	allowed.add('http://localhost:5173');
	allowed.add('http://localhost:5174');

	// Explicit client URL
	if (process.env.CLIENT_URL) {
		allowed.add(String(process.env.CLIENT_URL).trim());
	}

	// Vercel provides VERCEL_URL without scheme (e.g. my-app.vercel.app)
	if (process.env.VERCEL_URL) {
		allowed.add(`https://${process.env.VERCEL_URL}`);
	}

	return allowed;
}

function createCorsOptions() {
	const allowedOrigins = buildAllowedOrigins();
	return {
		origin(origin, callback) {
			// Non-browser clients / same-origin / curl
			if (!origin) return callback(null, true);

			if (allowedOrigins.has(origin)) return callback(null, true);

			// In Vercel preview/prod, allow any *.vercel.app origin by default.
			if (process.env.VERCEL) {
				try {
					const hostname = new URL(origin).hostname;
					if (/\.vercel\.app$/.test(hostname)) return callback(null, true);
				} catch {
					// Fall through to blocked origin below.
				}
			}

			return callback(new Error(`CORS blocked for origin: ${origin}`));
		},
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization'],
	};
}

function createApp() {
	const app = express();

	app.use(cors(createCorsOptions()));

	// Increase JSON body size limit to handle base64 images
	app.use(express.json({ limit: '20mb' }));
	app.use(express.urlencoded({ extended: true, limit: '20mb' }));

	// API routes
	app.use('/api/donations', donationRoutes);
	app.use('/api/auth', authRoutes);
	app.use('/api/admin', requireAuth, requireAdmin, adminRoutes);
	app.use('/api/ai', aiRoutes);
	app.use('/api/feedback', feedbackRoutes);
	app.use('/api/stories', storyRoutes);

	// Health/test route
	app.get('/', (req, res) => {
		res.send('Donorly API is running');
	});

	return app;
}

module.exports = {
	createApp,
};
