import mongoose from 'mongoose';

// ── Connection caching: reuse socket across serverless cold-starts ────────────
let _isConnected = false;

export async function connectDB() {
  // Guard: skip if already connected
  if (_isConnected && mongoose.connection.readyState === 1) {
    console.log('🟢 MongoDB: reusing existing connection');
    return;
  }

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nexus-esports';

  // Append Atlas-recommended options if connecting to Atlas (srv:// or mongodb+srv://)
  const isAtlas = uri.includes('mongodb+srv') || uri.includes('retryWrites');
  const finalUri = isAtlas ? uri : `${uri}?retryWrites=true&w=majority`;

  try {
    mongoose.set('strictQuery', false);

    const conn = await mongoose.connect(finalUri, {
      serverSelectionTimeoutMS: 10000, // 10s to select server
      socketTimeoutMS:          45000, // 45s socket idle timeout
    });

    _isConnected = true;
    console.log(`🟢 MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (err) {
    _isConnected = false;
    console.error(`🔴 MongoDB Connection Error: ${err.message}`);
    // Exit process on fatal DB failure — prevents silent fallback in production
    process.exit(1);
  }
}

export function isDBConnected() {
  return _isConnected && mongoose.connection.readyState === 1;
}
