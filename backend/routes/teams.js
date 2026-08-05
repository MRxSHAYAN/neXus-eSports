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

// Configure multer storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `team-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ storage });
const router = express.Router();

// GET /api/teams - List all teams
router.get('/', getAllTeams);

// GET /api/teams/:id - Get team details
router.get('/:id', getTeamById);

// POST /api/teams - Register new team
router.post('/', upload.single('logo'), registerTeam);

// PATCH /api/teams/:id/status - Update team status
router.patch('/:id/status', updateTeamStatus);

// DELETE /api/teams/:id - Delete team
router.delete('/:id', deleteTeam);

export default router;
