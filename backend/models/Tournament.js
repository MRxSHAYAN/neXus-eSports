import mongoose from 'mongoose';

const tournamentSchema = new mongoose.Schema({
  // ── Identity ────────────────────────────────────────────────
  title: {
    type: String,
    required: true,
    trim: true,
  },

  // ── Game Details ─────────────────────────────────────────────
  gameName: {
    type: String,
    required: true,
    trim: true,
    default: 'PUBG Mobile',
  },
  gameMode: {
    type: String,
    required: true,
    trim: true,
    default: 'Squad (4v4)',
  },

  // ── Pricing ──────────────────────────────────────────────────
  perPersonFee: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  teamFee: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },

  // ── Capacity ─────────────────────────────────────────────────
  maxSlots: {
    type: Number,
    required: true,
    default: 16,
    min: 1,
  },

  // ── Prize ────────────────────────────────────────────────────
  prizePool: {
    type: String,
    required: true,
    trim: true,
  },

  // ── Status: Active = open registrations, Disabled = closed ──
  status: {
    type: String,
    enum: ['Active', 'Disabled'],
    default: 'Active',
  },

  // ── Optional display fields ──────────────────────────────────
  date: {
    type: String,
    default: 'TBD',
    trim: true,
  },
  description: {
    type: String,
    default: '',
    trim: true,
  },
}, {
  timestamps: true,
});

const Tournament = mongoose.models.Tournament || mongoose.model('Tournament', tournamentSchema);
export default Tournament;
