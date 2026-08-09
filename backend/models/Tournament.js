import mongoose from 'mongoose';

const tournamentSchema = new mongoose.Schema({
  // ── Identity ────────────────────────────────────────────────
  id: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },

  // ── Core fields (spec-required) ─────────────────────────────
  title: {
    type: String,
    required: true,
    trim: true,
  },
  game: {
    type: String,
    default: 'PUBG Mobile',
    trim: true,
  },
  map: {
    type: String,
    default: 'Erangel',
    trim: true,
  },
  entryFee: {
    type: String,
    default: 'Free Entry',
    trim: true,
  },
  prizePool: {
    type: String,
    required: true,
    trim: true,
  },
  maxSlots: {
    type: Number,
    default: 16,
  },
  slotsRemaining: {
    type: Number,
    default: 16,
  },

  // ── Status: Active enables public registration, Disabled closes it ──
  status: {
    type: String,
    enum: ['Active', 'Disabled'],
    default: 'Active',
  },

  // ── Display fields ──────────────────────────────────────────
  mode: {
    type: String,
    default: 'Squad (4v4)',
  },
  date: {
    type: String,
    default: 'TBD',
  },
  banner: {
    type: String,
    default: '/Bg.jpg',
  },
  description: {
    type: String,
    default: 'NEXUS ESPORTS Official PUBG Mobile Tournament.',
  },
}, {
  timestamps: true,
});

const Tournament = mongoose.models.Tournament || mongoose.model('Tournament', tournamentSchema);
export default Tournament;
