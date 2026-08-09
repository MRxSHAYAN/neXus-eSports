import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  getAllTeams,
  getTeamById,
  registerTeam,
  updateTeamStatus,
  deleteTeam,
} from '../controllers/teamController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `proof-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Only image files are allowed'), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

const router = express.Router();

router.get('/',               getAllTeams);
router.get('/:id',            getTeamById);
router.post('/',              upload.single('screenshot'), registerTeam);
router.post('/register',      upload.single('screenshot'), registerTeam);
router.patch('/:id/status',   updateTeamStatus);
router.delete('/:id',         deleteTeam);

export default router;
