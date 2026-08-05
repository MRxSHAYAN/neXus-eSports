import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  getAllTournaments,
  getTournamentById,
  createTournament,
  updateTournament,
  deleteTournament
} from '../controllers/tournamentController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer storage for tournament banners
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `tournament-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ storage });
const router = express.Router();

// GET /api/tournaments - List all tournaments
router.get('/', getAllTournaments);

// GET /api/tournaments/:id - Get single tournament
router.get('/:id', getTournamentById);

// POST /api/tournaments - Create new tournament
router.post('/', upload.single('banner'), createTournament);

// PUT /api/tournaments/:id - Update tournament
router.put('/:id', upload.single('banner'), updateTournament);

// DELETE /api/tournaments/:id - Delete tournament
router.delete('/:id', deleteTournament);

export default router;
