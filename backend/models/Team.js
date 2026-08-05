import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  tournament: {
    type: String,
    required: true
  },
  captain: {
    type: String,
    required: true
  },
  discord: {
    type: String,
    default: ''
  },
  whatsapp: {
    type: String,
    default: ''
  },
  players: {
    type: [String],
    required: true
  },
  date: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['approved', 'pending', 'rejected'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    default: 'free'
  },
  transactionId: {
    type: String,
    default: 'FREE-ENTRY'
  },
  paymentProof: {
    type: String,
    default: ''
  },
  entryFee: {
    type: String,
    default: 'Free Entry'
  },
  logo: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

const Team = mongoose.models.Team || mongoose.model('Team', teamSchema);
export default Team;
