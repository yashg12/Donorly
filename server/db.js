const mongoose = require('mongoose');

function normalizeMongoUri(uri) {
	if (!uri) return uri;
	// On some machines, `localhost` may resolve to IPv6 first (`::1`).
	// Using 127.0.0.1 avoids IPv6/IPv4 binding confusion.
	if (uri.startsWith('mongodb://localhost')) {
		return uri.replace('mongodb://localhost', 'mongodb://127.0.0.1');
	}
	return uri;
}

// Serverless-friendly cached connection.
let cached = global.__DONORLY_MONGOOSE__;
if (!cached) {
	cached = global.__DONORLY_MONGOOSE__ = { conn: null, promise: null };
}

async function connectToDatabase() {
	if (cached.conn) return cached.conn;
	const mongoUri = normalizeMongoUri(process.env.MONGO_URI || '');
	if (!mongoUri) {
		throw new Error('Missing required env var: MONGO_URI');
	}

	if (!cached.promise) {
		cached.promise = mongoose
			.connect(mongoUri, {
				serverSelectionTimeoutMS: 5000,
			})
			.then((m) => m);
	}

	cached.conn = await cached.promise;
	return cached.conn;
}

module.exports = {
	connectToDatabase,
};
