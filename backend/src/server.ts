import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { requestMetrics } from './middleware/requestMetrics';
import { scaleMetrics } from './lib/scaleMetrics';
import { eventQueue } from './lib/eventQueue';
import { startScaleEventWorker } from './jobs/scaleEventWorker';

// Load environment variables
const envCandidates = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '.env.local'),
  path.resolve(process.cwd(), '..', '.env'),
  path.resolve(process.cwd(), '..', '.env.local'),
];

for (const envFile of envCandidates) {
  if (fs.existsSync(envFile)) {
    dotenv.config({ path: envFile, override: false });
  }
}

// Initialize Express app
const app: Express = express();
const PORT = process.env.PORT || 5000;

// ============================================
// MIDDLEWARE
// ============================================

// CORS Configuration
const configuredOrigins = (
  process.env.CORS_ALLOWED_ORIGINS ||
  process.env.FRONTEND_URL ||
  'https://pambo.biz,https://www.pambo.biz'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: configuredOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser middleware
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(requestMetrics);

// ============================================
// SUPABASE CLIENT
// ============================================

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  }
);

// ============================================
// HEALTH CHECK
// ============================================

app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'API running',
    database: 'connected',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/metrics', (req: Request, res: Response) => {
  const metricsToken = process.env.METRICS_TOKEN;
  const providedToken = req.header('x-metrics-token') || req.query.token;

  if (metricsToken && providedToken !== metricsToken) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized metrics access',
    });
  }

  return res.json({
    success: true,
    metrics: scaleMetrics.snapshot(),
    eventQueue: eventQueue.stats(),
  });
});

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================

interface CustomError extends Error {
  statusCode?: number;
}

const errorHandler = (err: CustomError, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode,
      timestamp: new Date().toISOString()
    }
  });
};

// ============================================
// API ROUTES - IMPORT THEM HERE
// ============================================

// Import route handlers
const authRoutes = require('./routes/auth').default;
const listingsRoutes = require('./routes/listings').default;
const ordersRoutes = require('./routes/orders').default;
const paymentsRoutes = require('./routes/payments').default;
const reviewsRoutes = require('./routes/reviews').default;
const adminRoutes = require('./routes/admin').default;
const matchmakingRoutes = require('./routes/matchmaking').default;
const wholesaleRoutes = require('./routes/wholesale').default;
const kenyaWholesaleRoutes = require('./routes/kenyaWholesale').default;
const secondhandRoutes = require('./routes/secondhand').default;

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/matchmaking', matchmakingRoutes);
app.use('/api/kenya-wholesale', kenyaWholesaleRoutes);
app.use('/api/wholesale', wholesaleRoutes);
app.use('/api/importlink-global', wholesaleRoutes);
app.use('/api/secondhand', secondhandRoutes);

// ============================================
// 404 HANDLER
// ============================================

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found',
      path: req.path,
      method: req.method
    }
  });
});

// ============================================
// ERROR HANDLER
// ============================================

app.use(errorHandler);

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  startScaleEventWorker();

  console.log(`
╔═══════════════════════════════════════════╗
║     PAMBO BACKEND SERVER RUNNING          ║
╠═══════════════════════════════════════════╣
║ 🚀 Port: ${PORT}
║ 🌍 URL: http://localhost:${PORT}
║ 📊 Health: http://localhost:${PORT}/health
║ 🔌 API: http://localhost:${PORT}/api/health
║ 🗄️  Database: ${process.env.VITE_SUPABASE_URL}
║ ⚙️  Mode: ${process.env.NODE_ENV || 'development'}
╚═══════════════════════════════════════════╝
  `);
});

export default app;
