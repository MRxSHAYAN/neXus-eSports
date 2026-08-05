import mongoose from 'mongoose';

const tournamentSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  game: {
    type: String,
    default: 'PUBG Mobile'
  },
  prize: {
    type: String,
    required: true
  },
  mode: {
    type: String,
    default: 'Squad (4v4)'
  },
  slots: {
    type: Number,
    default: 16
  },
  slotsRemaining: {
    type: Number,
    default: 16
  },
  status: {
    type: String,
    enum: ['live', 'upcoming', 'full', 'completed'],
    default: 'upcoming'
  },
  date: {
    type: String,
    required: true
  },
  entryFee: {
    type: String,
    default: 'Free Entry'
  },
  map: {
    type: String,
    default: 'Erangel'
  },
  banner: {
    type: String,
    default: '/Bg.jpg'
  },
  description: {
    type: String,
    default: 'NEXUS ESPORTS Official PUBG Mobile Tournament.'
  }
}, {
  timestamps: true
});

const Tournament = mongoose.models.Tournament || mongoose.model('Tournament', tournamentSchema);
export default Tournament;
