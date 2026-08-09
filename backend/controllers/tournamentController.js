import Tournament from '../models/Tournament.js';
import { isDBConnected } from '../config/db.js';

// ── In-memory fallback (empty — no mock data) ─────────────────────────────
let fallbackTournaments = [];

// ── Helpers ───────────────────────────────────────────────────────────────
function normaliseTournament(doc) {
  const obj = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
  // Ensure _id is serialisable
  if (obj._id) obj._id = obj._id.toString();
  return obj;
}

// ── GET /api/tournaments ──────────────────────────────────────────────────
export const getAllTournaments = async (req, res) => {
  try {
    const { status, search } = req.query;

    if (isDBConnected()) {
      const filter = {};
      if (status && status !== 'all') {
        filter.status = new RegExp(`^${status}$`, 'i');
      }
      if (search) {
        const q = new RegExp(search, 'i');
        filter.$or = [{ title: q }, { gameName: q }, { gameMode: q }];
      }
      const tournaments = await Tournament.find(filter).sort({ createdAt: -1 }).lean();
      return res.status(200).json({ success: true, count: tournaments.length, data: tournaments });
    }

    let list = [...fallbackTournaments];
    if (status && status !== 'all') {
      list = list.filter(t => (t.status || '').toLowerCase() === status.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        (t.title || '').toLowerCase().includes(q) ||
        (t.gameName || '').toLowerCase().includes(q) ||
        (t.gameMode || '').toLowerCase().includes(q)
      );
    }

    return res.status(200).json({ success: true, count: list.length, data: list });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve tournaments', error: err.message });
  }
};

// ── GET /api/tournaments/:id ──────────────────────────────────────────────
export const getTournamentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDBConnected()) {
      const t = await Tournament.findById(id).lean();
      if (!t) return res.status(404).json({ success: false, message: `Tournament not found` });
      return res.status(200).json({ success: true, data: t });
    }

    const t = fallbackTournaments.find(t => t._id === id || t.id === id);
    if (!t) return res.status(404).json({ success: false, message: `Tournament not found` });
    return res.status(200).json({ success: true, data: t });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve tournament', error: err.message });
  }
};

// ── POST /api/tournaments ─────────────────────────────────────────────────
export const createTournament = async (req, res) => {
  try {
    const {
      title, gameName, gameMode,
      perPersonFee, teamFee, maxSlots,
      prizePool, status, date, description,
    } = req.body;

    if (!title || !prizePool) {
      return res.status(400).json({ success: false, message: 'Title and prize pool are required' });
    }

    const payload = {
      title: (title || '').trim().toUpperCase(),
      gameName: (gameName || 'PUBG Mobile').trim(),
      gameMode: (gameMode || 'Squad (4v4)').trim(),
      perPersonFee: Number(perPersonFee) || 0,
      teamFee: Number(teamFee) || 0,
      maxSlots: Number(maxSlots) || 16,
      prizePool: (prizePool || '').trim(),
      status: status || 'Active',
      date: (date || 'TBD').trim(),
      description: (description || '').trim(),
    };

    if (isDBConnected()) {
      const created = await Tournament.create(payload);
      return res.status(201).json({ success: true, message: 'Tournament created', data: created });
    }

    const fallback = { _id: `local-${Date.now()}`, ...payload, createdAt: new Date().toISOString() };
    fallbackTournaments.unshift(fallback);
    return res.status(201).json({ success: true, message: 'Tournament created (local)', data: fallback });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create tournament', error: err.message });
  }
};

// ── PUT /api/tournaments/:id ──────────────────────────────────────────────
export const updateTournament = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    // Coerce numeric fields
    if (updates.perPersonFee !== undefined) updates.perPersonFee = Number(updates.perPersonFee);
    if (updates.teamFee !== undefined)       updates.teamFee      = Number(updates.teamFee);
    if (updates.maxSlots !== undefined)      updates.maxSlots     = Number(updates.maxSlots);

    if (isDBConnected()) {
      const updated = await Tournament.findByIdAndUpdate(id, updates, { new: true }).lean();
      if (!updated) return res.status(404).json({ success: false, message: 'Tournament not found' });
      return res.status(200).json({ success: true, message: 'Tournament updated', data: updated });
    }

    const idx = fallbackTournaments.findIndex(t => t._id === id || t.id === id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Tournament not found' });
    fallbackTournaments[idx] = { ...fallbackTournaments[idx], ...updates };
    return res.status(200).json({ success: true, message: 'Tournament updated', data: fallbackTournaments[idx] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update tournament', error: err.message });
  }
};

// ── DELETE /api/tournaments/:id ───────────────────────────────────────────
export const deleteTournament = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDBConnected()) {
      const deleted = await Tournament.findByIdAndDelete(id).lean();
      if (!deleted) return res.status(404).json({ success: false, message: 'Tournament not found' });
      return res.status(200).json({ success: true, message: 'Tournament deleted', data: deleted });
    }

    const idx = fallbackTournaments.findIndex(t => t._id === id || t.id === id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Tournament not found' });
    const deleted = fallbackTournaments.splice(idx, 1)[0];
    return res.status(200).json({ success: true, message: 'Tournament deleted', data: deleted });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete tournament', error: err.message });
  }
};
