import Team from '../models/Team.js';
import Tournament from '../models/Tournament.js';
import { isDBConnected } from '../config/db.js';

// In-memory fallback — empty by default
let fallbackTeams = [];

// ── GET /api/teams ────────────────────────────────────────────────────────
export const getAllTeams = async (req, res) => {
  try {
    const { status, tournament, search } = req.query;

    if (isDBConnected()) {
      const filter = {};
      if (status && status !== 'all')         filter.status          = new RegExp(`^${status}$`, 'i');
      if (tournament && tournament !== 'all') filter.tournamentTitle  = new RegExp(tournament, 'i');
      if (search) {
        const q = new RegExp(search, 'i');
        filter.$or = [{ squadName: q }, { captainName: q }, { transactionId: q }];
      }
      const teams = await Team.find(filter).sort({ createdAt: -1 }).lean();
      return res.status(200).json({ success: true, count: teams.length, data: teams });
    }

    let list = [...fallbackTeams];
    if (status && status !== 'all')
      list = list.filter(t => (t.status || '').toLowerCase() === status.toLowerCase());
    if (tournament && tournament !== 'all')
      list = list.filter(t => (t.tournamentTitle || '').toLowerCase().includes(tournament.toLowerCase()));
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        (t.squadName || '').toLowerCase().includes(q) ||
        (t.captainName || '').toLowerCase().includes(q) ||
        (t.transactionId || '').toLowerCase().includes(q)
      );
    }

    return res.status(200).json({ success: true, count: list.length, data: list });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve teams', error: err.message });
  }
};

// ── GET /api/teams/:id ────────────────────────────────────────────────────
export const getTeamById = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDBConnected()) {
      const team = await Team.findById(id).lean();
      if (team) return res.status(200).json({ success: true, data: team });
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    const team = fallbackTeams.find(t => t._id === id || t.id === id);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
    return res.status(200).json({ success: true, data: team });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve team', error: err.message });
  }
};

// ── POST /api/teams/register ──────────────────────────────────────────────
export const registerTeam = async (req, res) => {
  try {
    const {
      tournamentId, tournamentTitle,
      registrationType,
      squadName, captainName, captainPhone,
      player1Id, player2Id, player3Id, player4Id,
      selectedBank, transactionId, entryFee,
    } = req.body;

    if (!squadName || !captainName || !captainPhone) {
      return res.status(400).json({
        success: false,
        message: 'Squad/player name, captain name, and phone are required',
      });
    }

    const proofPath = req.file ? `/uploads/${req.file.filename}` : (req.body.screenshotUrl || '');
    const isFree    = !transactionId || transactionId === 'FREE-ENTRY' || Number(entryFee) === 0;
    const initialStatus = isFree ? 'Approved' : 'Pending';

    const payload = {
      tournamentTitle: tournamentTitle || '',
      registrationType: registrationType === 'Solo' ? 'Solo' : 'Team',
      squadName: (squadName || '').toUpperCase().trim(),
      captainName: (captainName || '').trim(),
      captainPhone: (captainPhone || '').trim(),
      player1Id: (player1Id || '').trim(),
      player2Id: (player2Id || '').trim(),
      player3Id: (player3Id || '').trim(),
      player4Id: (player4Id || '').trim(),
      selectedBank: selectedBank || '',
      transactionId: transactionId || 'FREE-ENTRY',
      screenshotUrl: proofPath,
      entryFee: entryFee || '0',
      status: initialStatus,
    };

    // Optionally link tournament ObjectId
    if (tournamentId && isDBConnected()) {
      try {
        const tour = await Tournament.findById(tournamentId).lean();
        if (tour) {
          payload.tournamentId = tournamentId;
          if (!payload.tournamentTitle) payload.tournamentTitle = tour.title;
        }
      } catch (_) { /* ignore invalid id */ }
    }

    if (isDBConnected()) {
      const created = await Team.create(payload);
      return res.status(201).json({ success: true, message: 'Registration submitted', data: created });
    }

    const fallback = { _id: `local-${Date.now()}`, ...payload, createdAt: new Date().toISOString() };
    fallbackTeams.unshift(fallback);
    return res.status(201).json({ success: true, message: 'Registration submitted (local)', data: fallback });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Registration failed', error: err.message });
  }
};

// ── PATCH /api/teams/:id/status ───────────────────────────────────────────
export const updateTeamStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const valid = ['Approved', 'Pending', 'Rejected'];
    const norm  = valid.find(v => v.toLowerCase() === (status || '').toLowerCase());
    if (!norm) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${valid.join(', ')}` });
    }

    if (isDBConnected()) {
      const updated = await Team.findByIdAndUpdate(id, { status: norm }, { new: true }).lean();
      if (!updated) return res.status(404).json({ success: false, message: 'Team not found' });
      return res.status(200).json({ success: true, message: `Status updated to ${norm}`, data: updated });
    }

    const idx = fallbackTeams.findIndex(t => t._id === id || t.id === id);
    if (idx !== -1) fallbackTeams[idx].status = norm;
    return res.status(200).json({ success: true, message: `Status updated to ${norm}` });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update team status', error: err.message });
  }
};

// ── DELETE /api/teams/:id ─────────────────────────────────────────────────
export const deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDBConnected()) {
      const deleted = await Team.findByIdAndDelete(id).lean();
      if (!deleted) return res.status(404).json({ success: false, message: 'Team not found' });
      return res.status(200).json({ success: true, message: 'Registration deleted' });
    }

    const idx = fallbackTeams.findIndex(t => t._id === id || t.id === id);
    if (idx !== -1) fallbackTeams.splice(idx, 1);
    return res.status(200).json({ success: true, message: 'Registration deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete team', error: err.message });
  }
};
