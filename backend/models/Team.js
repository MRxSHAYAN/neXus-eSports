import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  // ── Tournament reference ─────────────────────────────────────
  tournamentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    default: null,
  },
  tournamentTitle: {
    type: String,
    default: '',
    trim: true,
  },

  // ── Registration Type ────────────────────────────────────────
  registrationType: {
    type: String,
    enum: ['Solo', 'Team'],
    default: 'Team',
  },

  // ── Squad / Player info ──────────────────────────────────────
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
    required: true,
    trim: true,
  },

  // ── Player In-Game IDs (for team; player1 = solo player) ─────
  player1Id: { type: String, default: '', trim: true },
  player2Id: { type: String, default: '', trim: true },
  player3Id: { type: String, default: '', trim: true },
  player4Id: { type: String, default: '', trim: true },

  // ── Payment ──────────────────────────────────────────────────
  selectedBank: {
    type: String,
    default: '',
    trim: true,
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
  entryFee: {
    type: String,
    default: 'Free',
    trim: true,
  },

  // ── Admin review ─────────────────────────────────────────────
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  },

}, {
  timestamps: true,
});

const Team = mongoose.models.Team || mongoose.model('Team', teamSchema);
export default Team;
