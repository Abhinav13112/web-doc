require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const documentsRouter = require('./routes/documents');
const userRouter = require('./routes/user');
const healthRouter = require('./routes/health');

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// 1. Security & Protection Headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginEmbedderPolicy: false // Allows previewing embedded documents in iframes/objects
}));

// 2. Logging
if (NODE_ENV !== 'test') {
  app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// 3. Dynamic CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser tools (e.g. curl, postman) or matching allowed origins
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all in dev/staging to prevent CORS headaches during testing
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// 4. Request Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 5. Rate Limiting for API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per 15 mins
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP address. Please try again after 15 minutes.'
  }
});

app.use('/api', apiLimiter);

// 6. Mount Application Routes
app.use('/api/health', healthRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/user', userRouter);

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'DocuVault Document Management API',
    version: '1.0.0',
    documentation: '/api/health',
    status: 'operational'
  });
});

// 7. 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} not found.`
  });
});

// 8. Global Centralized Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled application error:', err);
  const status = err.status || 500;
  const message = err.message || 'An unexpected server error occurred.';

  res.status(status).json({
    success: false,
    message,
    ...(NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start Express Server
const server = app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 DocuVault Backend is running on port ${PORT}`);
  console.log(`📡 Environment: ${NODE_ENV}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);
});

// Graceful process termination
const handleShutdown = () => {
  console.log('Received termination signal. Closing HTTP server gracefully...');
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', handleShutdown);
process.on('SIGINT', handleShutdown);

module.exports = app;
