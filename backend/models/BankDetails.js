import mongoose from 'mongoose';

/**
 * BankDetails — singleton document (only one record ever exists).
 * Stores exactly 2 payment accounts.
 * Admin updates via PUT /api/bank.
 * Public reads via GET /api/bank.
 */
const bankDetailsSchema = new mongoose.Schema({
  // ── Account 1 (e.g., JazzCash / EasyPaisa) ──────────────────
  account1Provider: { type: String, default: 'JazzCash',      trim: true },
  account1Title:    { type: String, default: 'NEXUS ESPORTS', trim: true },
  account1Number:   { type: String, default: '',              trim: true },

  // ── Account 2 (e.g., Bank Account / SadaPay) ────────────────
  account2Provider: { type: String, default: 'EasyPaisa',     trim: true },
  account2Title:    { type: String, default: 'NEXUS ESPORTS', trim: true },
  account2Number:   { type: String, default: '',              trim: true },

}, { timestamps: true });

const BankDetails = mongoose.models.BankDetails || mongoose.model('BankDetails', bankDetailsSchema);
export default BankDetails;
