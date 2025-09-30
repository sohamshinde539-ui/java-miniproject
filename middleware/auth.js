const jwt = require('jsonwebtoken');
const db = require('../models/database');

// Middleware to authenticate JWT token
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check if token exists in sessions table (for revocation capability)
        const session = await db.get('SELECT * FROM sessions WHERE token = ? AND expires_at > datetime("now")', [token]);
        if (!session) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        // Get user info
        const user = await db.get('SELECT id, username, role, name FROM users WHERE id = ?', [decoded.userId]);
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        return res.status(403).json({ error: 'Invalid token' });
    }
};

// Middleware to authorize specific roles
const authorizeRole = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        next();
    };
};

// Middleware to authorize admin only
const authorizeAdmin = authorizeRole(['admin']);

// Middleware to authorize student only
const authorizeStudent = authorizeRole(['student']);

// Middleware to authorize both admin and student
const authorizeUser = authorizeRole(['admin', 'student']);

module.exports = {
    authenticateToken,
    authorizeRole,
    authorizeAdmin,
    authorizeStudent,
    authorizeUser
};