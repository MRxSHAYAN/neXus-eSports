import express from 'express';
import { getAdminStats } from '../controllers/adminController.js';
import { getAllTeams, updateTeamStatus, deleteTeam } from '../controllers/teamController.js';
import { getBankDetails, updateBankDetails } from '../controllers/bankController.js';

const router = express.Router();

// GET /api/admin/stats
router.get('/stats', getAdminStats);

// Team management
router.get('/teams',              getAllTeams);
router.patch('/teams/:id/status', updateTeamStatus);
router.delete('/teams/:id',       deleteTeam);

// Bank details management
router.get('/bank', getBankDetails);
router.put('/bank', updateBankDetails);

export default router;
