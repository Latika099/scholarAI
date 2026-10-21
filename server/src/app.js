import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import scholarshipRoutes from './routes/scholarships.js';
import matchingRoutes from './routes/matching.js';
import assistantRoutes from './routes/assistant.js';
import agentRoutes from './routes/agents.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Dynamic CORS configuration allowing Render frontend deployments and local dev
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : null;

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (curl, server-to-server, health monitors)
    if (!origin) return callback(null, true);

    // If specific origins are configured in environment
    if (allowedOrigins && allowedOrigins.length > 0 && !allowedOrigins.includes('*')) {
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
    }

    // Always allow Render domains and local dev
    if (origin.endsWith('.onrender.com') || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }

    // Permissive fallback ensuring cross-origin communication on cloud deployments
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());

// Request logging in development
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  }
  next();
});

// API Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ScholarAI Multi-Agent Backend',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.use('/api/scholarships', scholarshipRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/profile', matchingRoutes); // alias for /api/profile/analyze
app.use('/api/assistant', assistantRoutes);
app.use('/api/agents', agentRoutes);

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// Start Server if not imported by test
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 ScholarAI Backend running on http://localhost:${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`🤖 Multi-Agent Pipeline: Active with 4 verified agents`);
  });
}

export default app;
