import mongoose from 'mongoose';
import Tournament from '../models/Tournament.js';
import Team from '../models/Team.js';

let isConnected = false;

export async function connectDB() {
  const uri = process.env.MONGO_URI || process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/nexus_esports';

  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    isConnected = true;
    console.log(`mongodb connected: ${conn.connection.host}/${conn.connection.name}`);
    await seedInitialData();
  } catch (err) {
    isConnected = false;
    console.warn(`mongodb unavailable: ${err.message}`);
    console.warn('running in memory fallback mode');
  }
}

async function seedInitialData() {
  try {
    if (await Tournament.countDocuments() === 0) {
      await Tournament.insertMany([
        {
          id: 'nexus-open-12',
          title: 'NEXUS OPEN CUP #12',
          game: 'PUBG Mobile',
          prize: 'PKR 5,000',
          mode: 'Squad (4v4)',
          slots: 16,
          slotsRemaining: 6,
          status: 'live',
          date: 'Today - Ongoing',
          entryFee: 'Free Entry',
          map: 'Erangel',
          banner: '/Bg.jpg',
          description: 'Free entry daily cup on Erangel.',
        },
        {
          id: 'weekend-warrior-s3',
          title: 'WEEKEND WARRIOR S3',
          game: 'PUBG Mobile',
          prize: 'PKR 10,000',
          mode: 'Squad (4v4)',
          slots: 24,
          slotsRemaining: 18,
          status: 'upcoming',
          date: 'Aug 10, 2026',
          entryFee: 'PKR 100 / Team',
          map: 'Miramar',
          banner: '/Bg.jpg',
          description: 'Weekend series, 24 squads, 5 matches.',
        },
        {
          id: 'friday-frag-night',
          title: 'FRIDAY FRAG NIGHT',
          game: 'PUBG Mobile',
          prize: 'PKR 3,000',
          mode: 'Duo (2v2)',
          slots: 20,
          slotsRemaining: 0,
          status: 'full',
          date: 'Aug 8, 2026',
          entryFee: 'PKR 50 / Team',
          map: 'Sanhok',
          banner: '/Bg.jpg',
          description: 'Duo showdown on Sanhok.',
        },
        {
          id: 'erangel-elite',
          title: 'ERANGEL ELITE CUP',
          game: 'PUBG Mobile',
          prize: 'PKR 15,000',
          mode: 'Squad (4v4)',
          slots: 32,
          slotsRemaining: 24,
          status: 'upcoming',
          date: 'Aug 24, 2026',
          entryFee: 'PKR 150 / Team',
          map: 'Erangel',
          banner: '/Bg.jpg',
          description: 'Erangel championship, 32 squads.',
        },
      ]);
    }

    if (await Team.countDocuments() === 0) {
      await Team.insertMany([
        {
          id: 'team-001',
          name: 'ALPHA SQUAD',
          tournament: 'NEXUS OPEN CUP #12',
          captain: 'AlphaLeader',
          discord: 'AlphaLeader#1234',
          whatsapp: '+92 300 1234567',
          players: ['AlphaLeader|5123456789','AlphaSlayer|5123456790','AlphaSniper|5123456791','AlphaScout|5123456792'],
          date: 'Aug 02, 2026',
          status: 'approved',
          paymentMethod: 'free',
          transactionId: 'FREE-ENTRY',
          paymentProof: '',
          entryFee: 'Free Entry',
          logo: null,
        },
        {
          id: 'team-002',
          name: 'NOVA ESPORTS',
          tournament: 'WEEKEND WARRIOR S3',
          captain: 'NovaPrime',
          discord: 'NovaPrime#9988',
          whatsapp: '+92 312 9876543',
          players: ['NovaPrime|5234567891','NovaGhost|5234567892','NovaShadow|5234567893','NovaVenom|5234567894'],
          date: 'Aug 03, 2026',
          status: 'pending',
          paymentMethod: 'jazzcash',
          transactionId: 'TXN987654321',
          paymentProof: '',
          entryFee: 'PKR 100 / Squad',
          logo: null,
        },
        {
          id: 'team-003',
          name: 'SOUL WARRIORS',
          tournament: 'NEXUS OPEN CUP #12',
          captain: 'SoulMortal',
          discord: 'Mortal#0001',
          whatsapp: '+92 333 4445556',
          players: ['SoulMortal|5345678901','SoulViper|5345678902','SoulRegaltos|5345678903','SoulAman|5345678904'],
          date: 'Aug 04, 2026',
          status: 'approved',
          paymentMethod: 'free',
          transactionId: 'FREE-ENTRY',
          paymentProof: '',
          entryFee: 'Free Entry',
          logo: null,
        },
      ]);
    }
  } catch (err) {
    console.error('seed error:', err.message);
  }
}

export function isDBConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}
