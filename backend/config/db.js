import mongoose from 'mongoose';

let _isConnected = false;

export async function connectDB() {
  // Guard: skip if already connected
  if (_isConnected && mongoose.connection.readyState === 1) {
    console.log('🟢 MongoDB: reusing existing connection');
    return;
  }

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nexus-esports';

  // Fix: Check if parameters already exist in URI to prevent malformed query parameters
  let finalUri = uri;
  if (!uri.includes('retryWrites=true') && !uri.includes('127.0.0.1') && !uri.includes('localhost')) {
    finalUri = uri.includes('?') ? `${uri}&retryWrites=true&w=majority` : `${uri}?retryWrites=true&w=majority`;
  }

  try {
    mongoose.set('strictQuery', false);

    const conn = await mongoose.connect(finalUri, {
      serverSelectionTimeoutMS: 10000, // 10s server selection
      socketTimeoutMS: 45000,          // 45s socket idle timeout
    });

    _isConnected = true;
    console.log(`🟢 MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (err) {
    _isConnected = false;
    console.error(`🔴 MongoDB Connection Error: ${err.message}`);
    
    // Exit on fatal failure only in standard server environments (don't force exit in serverless execution)
    if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
      process.exit(1);
    }
  }
}

export function isDBConnected() {
  return _isConnected && mongoose.connection.readyState === 1;
}