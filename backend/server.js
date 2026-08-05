import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB, isDBConnected } from './config/db.js';
import teamsRoutes from './routes/teams.js';
import tournamentsRoutes from './routes/tournaments.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize MongoDB connection via Mongoose
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

// Enable Cross-Origin Resource Sharing (CORS) for frontend clients
app.use(cors({
  origin: CORS_ORIGIN === '*' ? '*' : [CORS_ORIGIN, 'http://localhost:4321', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded files (logos, proof screenshots, tournament banners)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'NEXUS ESPORTS API',
    database: isDBConnected() ? 'MongoDB (Connected)' : 'Fallback Memory Mode (MongoDB Offline)',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/teams', teamsRoutes);
app.use('/api/tournaments', tournamentsRoutes);

// 404 Handler for undefined API endpoints
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found.`
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'NEXUS ESPORTS API',
    version: '1.0.0',
    database: isDBConnected() ? 'MongoDB' : 'Fallback Memory Engine',
    endpoints: {
      health: 'GET /api/health',
      teams: 'GET, POST /api/teams',
      tournaments: 'GET, POST /api/tournaments'
    }
  });
});

// Central Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`
  ======================================================
  🎮  NEXUS ESPORTS REST API BACKEND RUNNING
  ======================================================
  📡  Server Port:   http://localhost:${PORT}
  🗄️   Database URI:  ${process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nexus_esports'}
  🏥  Health Check:  http://localhost:${PORT}/api/health
  🛡️   Teams API:     http://localhost:${PORT}/api/teams
  🏆  Tourneys API:  http://localhost:${PORT}/api/tournaments
  ======================================================
  `);
});
