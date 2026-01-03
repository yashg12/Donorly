const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
	try {
		const header = req.headers && req.headers.authorization;
		if (!header) {
			return res.status(401).json({ error: 'Missing Authorization header' });
		}

		const [scheme, token] = String(header).split(' ');
		if (scheme !== 'Bearer' || !token) {
			return res.status(401).json({ error: 'Invalid Authorization header format' });
		}

		const jwtSecret = process.env.JWT_SECRET;
		if (!jwtSecret) {
			return res.status(500).json({ error: 'Server misconfiguration (missing JWT_SECRET)' });
		}

		const decoded = jwt.verify(token, jwtSecret);
		req.user = decoded;
		return next();
	} catch (err) {
		return res.status(401).json({ error: 'Invalid or expired token' });
	}
}

function requireAdmin(req, res, next) {
	const role = req.user && req.user.role;
	if (role !== 'ADMIN') {
		return res.status(403).json({ error: 'Admin access required' });
	}
	return next();
}

module.exports = {
	requireAuth,
	requireAdmin,
};
