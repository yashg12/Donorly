const { createApp } = require('../server/app');
const { connectToDatabase } = require('../server/db');

const app = createApp();

module.exports = async (req, res) => {
	try {
		await connectToDatabase();
		return app(req, res);
	} catch (err) {
		const msg = err?.message || String(err);
		// Avoid leaking secrets; keep error concise.
		return res.status(500).json({ error: 'Server initialization failed', details: msg });
	}
};
