import mongoose from 'mongoose';

let isConnected = false;

export async function connectDB() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nexus-esports';

  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    isConnected = true;
    console.log(`mongodb connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (err) {
    isConnected = false;
    console.warn(`mongodb unavailable: ${err.message}`);
    console.warn('running in memory fallback mode');
  }
}

export function isDBConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}
