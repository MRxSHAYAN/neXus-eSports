import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema({
  // ── Tournament reference ─────────────────────────────────────
  tournamentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    default: null,
  },
  // Denormalised tournament title for quick display
  tournamentTitle: {
    type: String,
    default: '',
    trim: true,
  },

  // ── Squad info ───────────────────────────────────────────────
  squadName: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
  },
  captainName: {
    type: String,
    required: true,
    trim: true,
  },
  captainPhone: {
    type: String,
    default: '',
    trim: true,
  },

  // ── Player UIDs / IGNs ───────────────────────────────────────
  player1Id: { type: String, default: '' },
  player2Id: { type: String, default: '' },
  player3Id: { type: String, default: '' },
  player4Id: { type: String, default: '' },

  // ── Payment ──────────────────────────────────────────────────
  paymentMethod: {
    type: String,
    enum: ['JazzCash', 'EasyPaisa', 'SadaPay', 'Free'],
    default: 'Free',
  },
  transactionId: {
    type: String,
    default: 'FREE-ENTRY',
    trim: true,
  },
  screenshotUrl: {
    type: String,
    default: '',
  },

  // ── Admin review ─────────────────────────────────────────────
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  },

  // ── Legacy compat fields (kept so existing seeded data stays readable) ──
  entryFee: { type: String, default: 'Free Entry' },

}, {
  timestamps: true,
});

// Use "Team" collection name for backward compatibility with existing data
const Registration = mongoose.models.Registration || mongoose.model('Registration', registrationSchema, 'teams');
export default Registration;
