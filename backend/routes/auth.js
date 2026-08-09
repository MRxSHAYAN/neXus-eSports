import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

// ── Credentials (hardened: read from env, fallback to hardcoded) ────────────
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'nexus';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'nexus123098';
const JWT_SECRET     = process.env.JWT_SECRET     || 'nexus_esports_jwt_secret_2026';
const JWT_EXPIRES_IN = '12h';

// ── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Access denied.' });
    }

    const token = jwt.sign(
      { username: ADMIN_USERNAME, role: 'admin' },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(200).json({
      success: true,
      message: 'Authenticated successfully.',
      token,
      expiresIn: JWT_EXPIRES_IN,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Auth error', error: err.message });
  }
});

// ── GET /api/auth/verify ─────────────────────────────────────────────────────
router.get('/verify', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided.' });
    }

    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, JWT_SECRET);

    return res.status(200).json({
      success: true,
      message: 'Token valid.',
      user: { username: decoded.username, role: decoded.role },
    });
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired.' });
  }
});

export default router;
