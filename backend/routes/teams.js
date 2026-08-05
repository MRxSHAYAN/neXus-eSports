import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  getAllTeams,
  getTeamById,
  registerTeam,
  updateTeamStatus,
  deleteTeam
} from '../controllers/teamController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer storage for payment proof screenshot & team logo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `proof-${uniqueSuffix}${ext}`);
  }
});

// File filter for images (JPEG, PNG, WEBP)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPG, PNG, WEBP) are allowed for payment proof!'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter
});

const router = express.Router();

// GET /api/teams - List all teams
router.get('/', getAllTeams);

// GET /api/teams/:id - Get team details
router.get('/:id', getTeamById);

// POST /api/teams - Register team with payment proof / logo screenshot
router.post('/', upload.single('paymentProof'), registerTeam);

// POST /api/teams/register - Alias route for frontend convenience
router.post('/register', upload.single('paymentProof'), registerTeam);

// PATCH /api/teams/:id/status - Update team approval status
router.patch('/:id/status', updateTeamStatus);

// DELETE /api/teams/:id - Remove registered team
router.delete('/:id', deleteTeam);

export default router;
