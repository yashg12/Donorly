const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables from server/.env when present.
// - Local dev relies on this file.
// - Vercel injects env vars; on Vercel the file typically won't exist.
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
	dotenv.config({ path: envPath });
}

const { createApp } = require('./app');
const { connectToDatabase } = require('./db');

const PORT = process.env.PORT || 5000;
const IS_SMOKE_TEST = process.env.SMOKE_TEST === '1';

const app = createApp();

if (IS_SMOKE_TEST) {
	console.log('SMOKE_TEST=1: server initialized (routes registered). Skipping DB connect and listen.');
	process.exit(0);
}

connectToDatabase()
	.then(() => {
		console.log('MongoDB Connected');
		app.listen(PORT, () => {
			console.log(`Server running on port ${PORT}`);
		});
	})
	.catch((err) => {
		const msg = err?.message || String(err);
		console.error('Failed to initialize server:', msg);
		process.exit(1);
	});

