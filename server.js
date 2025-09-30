const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const db = require('./models/database');

// Import routes
const authRoutes = require('./routes/auth');
const homeworkRoutes = require('./routes/homework');
const assignmentRoutes = require('./routes/assignments');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for development (enable in production with proper config)
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the RateLimit-* headers
    legacyHeaders: false, // Disable the X-RateLimit-* headers
    // Skip limiting for auth routes so login/registration never get blocked
    skip: (req) => req.path && req.path.startsWith('/api/auth'),
    handler: (req, res) => {
        res.status(429).json({ error: 'Too many requests from this IP, please try again later.' });
    }
});
// Trust proxy to ensure correct client IP detection behind proxies (safer for rate limiting)
app.set('trust proxy', 1);
// Apply limiter for API routes (auth routes are skipped via the skip() above)
app.use('/api', limiter);

// CORS configuration
app.use(cors({
    // In production, the app and API will share the same origin, so allowing any origin is fine here.
    // For local dev, localhost will be allowed as well.
    origin: (origin, cb) => cb(null, true),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (HTML pages)
app.use(express.static('.', {
    etag: false,
    lastModified: false,
    cacheControl: false,
    setHeaders: (res, filePath) => {
        res.set('Cache-Control', 'no-store');
    }
}));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/homework', homeworkRoutes);
app.use('/api/assignments', assignmentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'to do.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin portal.html'));
});

app.get('/student', (req, res) => {
    res.sendFile(path.join(__dirname, 'to do.html'));
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Global error handler:', error);

    const message = process.env.NODE_ENV === 'production'
        ? 'Something went wrong!'
        : error.message;

    res.status(error.status || 500).json({
        error: message,
        ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
    });
});

// Graceful shutdown handler
let serverInstance;
const gracefulShutdown = (signal) => {
    console.log(`Received ${signal}. Starting graceful shutdown...`);

    if (serverInstance) {
        serverInstance.close((err) => {
            if (err) {
                console.error('Error during server close:', err);
                process.exit(1);
            }

            console.log('HTTP server closed.');
            db.close();
            process.exit(0);
        });
    } else {
        db.close();
        process.exit(0);
    }
};

// Start server
async function startServer() {
    try {
        await db.connect();
        console.log('Database connected successfully');

        serverInstance = app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`📚 Student Portal: http://localhost:${PORT}/student`);
            console.log(`🔧 Admin Portal: http://localhost:${PORT}/admin`);
            console.log(`❤️  API Health: http://localhost:${PORT}/api/health`);
            console.log('');
            console.log('Default credentials:');
            console.log('👨‍🎓 Student - Username: student, Password: password123');
            console.log('👨‍💼 Admin - Username: admin, Password: admin123');
        });

        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

        return serverInstance;
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    startServer();
}

module.exports = { app, startServer };
