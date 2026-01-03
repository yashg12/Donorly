// Core requirements
const donationRoutes = require('./routes/donationRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./adminRoutes');
const aiRoutes = require('./routes/aiRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const storyRoutes = require('./routes/storyRoutes');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { requireAuth, requireAdmin } = require('./middleware/auth');

// Load environment variables
dotenv.config();

// Validate required environment variables
const PORT = process.env.PORT || 5000;
const IS_SMOKE_TEST = process.env.SMOKE_TEST === '1';

function normalizeMongoUri(uri) {
	if (!uri) return uri;
	// On some machines, `localhost` may resolve to IPv6 first (`::1`).
	// Using 127.0.0.1 avoids IPv6/IPv4 binding confusion.
	if (uri.startsWith('mongodb://localhost')) {
		return uri.replace('mongodb://localhost', 'mongodb://127.0.0.1');
	}
	return uri;
}

const MONGO_URI = normalizeMongoUri(process.env.MONGO_URI || '');


if (!IS_SMOKE_TEST && !MONGO_URI) {
	console.error('Missing required env var: MONGO_URI (set it in server/.env)');
	process.exit(1);
}

// Initialize app
const app = express();

// Middlewares
app.use(cors({
  origin: [process.env.CLIENT_URL || 'http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

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

if (IS_SMOKE_TEST) {
	console.log('SMOKE_TEST=1: server initialized (routes registered). Skipping DB connect and listen.');
	process.exit(0);
}

// MongoDB connection
async function connectDB() {
	try {
		await mongoose.connect(MONGO_URI, {
			serverSelectionTimeoutMS: 5000,
		});
		console.log('MongoDB Connected');
	} catch (err) {
		const msg = err?.message || String(err);
		console.error('MongoDB connection error:', msg);
		if (msg.includes('ECONNREFUSED')) {
			console.error(
				`\nMongoDB refused the connection at ${MONGO_URI}.\n` +
				`This usually means MongoDB isn\'t running, is listening on a different port, or you\'re using the wrong URI.\n` +
				`Fix options:\n` +
				`- Start MongoDB locally (Windows service "MongoDB" / start mongod), then retry\n` +
				`- Or change MONGO_URI in server/.env to your MongoDB Atlas connection string\n`
			);
		}
		process.exit(1);
	}
}

// Start server only after DB connects
connectDB()
	.then(() => {
		app.listen(PORT, () => {
			console.log(`Server running on port ${PORT}`);
		});
	})
	.catch((err) => {
		console.error('Failed to initialize server:', err);
		process.exit(1);
	});

