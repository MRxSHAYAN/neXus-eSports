import mongoose from 'mongoose';

/**
 * BankDetails — singleton document (only one record ever exists).
 * Admin can update via PUT /api/bank.
 * Public can read via GET /api/bank.
 */
const bankDetailsSchema = new mongoose.Schema({
  // ── JazzCash ─────────────────────────────────────────────────
  jazzcashTitle:  { type: String, default: 'NEXUS ESPORTS', trim: true },
  jazzcashNumber: { type: String, default: '', trim: true },

  // ── EasyPaisa ────────────────────────────────────────────────
  easypaisaTitle:  { type: String, default: 'NEXUS ESPORTS', trim: true },
  easypaisaNumber: { type: String, default: '', trim: true },

  // ── SadaPay ──────────────────────────────────────────────────
  sadapayTitle:  { type: String, default: 'NEXUS ESPORTS', trim: true },
  sadapayNumber: { type: String, default: '', trim: true },

  // ── Optional per-method instructions ────────────────────────
  jazzcashInstructions:  { type: String, default: 'Send entry fee via JazzCash Mobile Wallet.' },
  easypaisaInstructions: { type: String, default: 'Send entry fee via EasyPaisa Mobile Wallet.' },
  sadapayInstructions:   { type: String, default: 'Send IBFT to SadaPay. Include squad name in remarks.' },

}, {
  timestamps: true,
});

const BankDetails = mongoose.models.BankDetails || mongoose.model('BankDetails', bankDetailsSchema);
export default BankDetails;
