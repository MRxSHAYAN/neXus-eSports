import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { connectDB, isDBConnected } from './config/db.js';

import teamsRoutes       from './routes/teams.js';
import bankRoutes        from './routes/bank.js';
import adminRoutes       from './routes/admin.js';
import tournamentsRoutes from './routes/tournaments.js';
import authRoutes        from './routes/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

connectDB();

const app         = express();
const PORT        = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

app.use(cors({
  origin: CORS_ORIGIN === '*'
    ? '*'
    : [CORS_ORIGIN, 'http://localhost:4321', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadsDir));

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status:    'online',
    service:   'nexus-esports-api',
    database:  isDBConnected() ? 'mongodb' : 'memory',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth',        authRoutes);
app.use('/api/teams',       teamsRoutes);
app.use('/api/bank',        bankRoutes);
app.use('/api/admin',       adminRoutes);
app.use('/api/tournaments', tournamentsRoutes);

app.get('/', (req, res) => {
  res.json({
    name:    'nexus-esports-api',
    version: '1.0.0',
    endpoints: {
      health:      'GET  /api/health',
      authLogin:   'POST /api/auth/login',
      authVerify:  'GET  /api/auth/verify',
      teams:       'GET, POST /api/teams',
      bank:        'GET, PUT  /api/bank',
      adminStats:  'GET  /api/admin/stats',
      adminTeams:  'GET, PATCH, DELETE /api/admin/teams',
      tournaments: 'GET, POST, PUT, PATCH, DELETE /api/tournaments',
    },
  });
});

app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: `${req.originalUrl} not found` });
});

app.use((err, req, res, next) => {
  console.error('[error]', err.message);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
