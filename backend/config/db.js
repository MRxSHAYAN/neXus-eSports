import mongoose from 'mongoose';
import Tournament from '../models/Tournament.js';
import Team from '../models/Team.js';

let isConnected = false;

/**
 * Connect to MongoDB database via Mongoose
 */
export async function connectDB() {
  const mongoURI = process.env.MONGO_URI || process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/nexus_esports';

  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000 // 5 seconds timeout
    });

    isConnected = true;
    console.log(`🍃 Connected to MongoDB: ${conn.connection.host}/${conn.connection.name}`);

    // Seed initial data if collections are empty
    await seedInitialData();
  } catch (error) {
    isConnected = false;
    console.warn(`⚠️  MongoDB connection warning: ${error.message}`);
    console.warn(`💡  Ensure local MongoDB is running at ${mongoURI} (or install MongoDB Community Server). The API will continue serving initial mock data in fallback mode.`);
  }
}

/**
 * Seed initial sample tournaments and teams into MongoDB
 */
async function seedInitialData() {
  try {
    const tournamentCount = await Tournament.countDocuments();
    if (tournamentCount === 0) {
      console.log('🌱 Seeding initial PUBG Mobile Tournaments into MongoDB...');
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
          date: 'Today – Ongoing',
          entryFee: 'Free Entry',
          map: 'Erangel',
          banner: '/Bg.jpg',
          description: 'The flagship free-to-enter daily cup. Top squads battle on Erangel for glory and instant cash rewards.'
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
          description: 'High-octane weekend tournament series. 24 elite squads compete across 5 matches.'
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
          description: 'Fast-paced Duo showdown on Sanhok. Pure gunplay and intense close-quarters combat.'
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
          description: 'The ultimate Erangel championship. Premier teams locked in tactical combat for the grand trophy.'
        }
      ]);
    }

    const teamCount = await Team.countDocuments();
    if (teamCount === 0) {
      console.log('🌱 Seeding initial Registered Teams into MongoDB...');
      await Team.insertMany([
        {
          id: 'team-001',
          name: 'ALPHA SQUAD',
          tournament: 'NEXUS OPEN CUP #12',
          captain: 'AlphaLeader',
          discord: 'AlphaLeader#1234',
          whatsapp: '+92 300 1234567',
          players: ['AlphaLeader|5123456789', 'AlphaSlayer|5123456790', 'AlphaSniper|5123456791', 'AlphaScout|5123456792'],
          date: 'Aug 02, 2026',
          status: 'approved',
          paymentMethod: 'free',
          transactionId: 'FREE-ENTRY',
          paymentProof: '',
          entryFee: 'Free Entry',
          logo: null
        },
        {
          id: 'team-002',
          name: 'NOVA ESPORTS',
          tournament: 'WEEKEND WARRIOR S3',
          captain: 'NovaPrime',
          discord: 'NovaPrime#9988',
          whatsapp: '+92 312 9876543',
          players: ['NovaPrime|5234567891', 'NovaGhost|5234567892', 'NovaShadow|5234567893', 'NovaVenom|5234567894'],
          date: 'Aug 03, 2026',
          status: 'pending',
          paymentMethod: 'jazzcash',
          transactionId: 'TXN987654321',
          paymentProof: '/uploads/proof-002.jpg',
          entryFee: 'PKR 100 / Squad',
          logo: null
        },
        {
          id: 'team-003',
          name: 'SOUL WARRIORS',
          tournament: 'NEXUS OPEN CUP #12',
          captain: 'SoulMortal',
          discord: 'Mortal#0001',
          whatsapp: '+92 333 4445556',
          players: ['SoulMortal|5345678901', 'SoulViper|5345678902', 'SoulRegaltos|5345678903', 'SoulAman|5345678904'],
          date: 'Aug 04, 2026',
          status: 'approved',
          paymentMethod: 'free',
          transactionId: 'FREE-ENTRY',
          paymentProof: '',
          entryFee: 'Free Entry',
          logo: null
        },
        {
          id: 'team-004',
          name: 'GHOST REAPERS',
          tournament: 'MIRAMAR MAYHEM',
          captain: 'ReaperX',
          discord: 'ReaperX#5544',
          whatsapp: '+92 345 6789012',
          players: ['ReaperX|5456789012', 'ReaperSpecter|5456789013', 'ReaperPhantom|5456789014', 'ReaperWraith|5456789015'],
          date: 'Aug 05, 2026',
          status: 'pending',
          paymentMethod: 'easypaisa',
          transactionId: 'EP8877665544',
          paymentProof: '/uploads/proof-004.jpg',
          entryFee: 'PKR 75 / Squad',
          logo: null
        }
      ]);
    }
  } catch (err) {
    console.error('Error seeding MongoDB data:', err.message);
  }
}

export function isDBConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}
