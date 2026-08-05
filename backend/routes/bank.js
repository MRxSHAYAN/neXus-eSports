import express from 'express';
import { getBankDetails, updateBankDetails } from '../controllers/bankController.js';

const router = express.Router();

// GET /api/bank - Fetch dynamic bank account details
router.get('/', getBankDetails);

// PUT /api/bank - Update bank account details (Admin action)
router.put('/', updateBankDetails);

export default router;
