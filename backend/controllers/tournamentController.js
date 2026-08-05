import Tournament from '../models/Tournament.js';
import { isDBConnected } from '../config/db.js';

// In-memory fallback dataset in case local MongoDB is offline
let fallbackTournaments = [
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
];

/**
 * GET /api/tournaments
 * Get all tournaments from MongoDB (or fallback)
 */
export const getAllTournaments = async (req, res) => {
  try {
    const { status, search } = req.query;

    if (isDBConnected()) {
      const filter = {};
      if (status && status !== 'all') filter.status = new RegExp(`^${status}$`, 'i');
      if (search) {
        const q = new RegExp(search, 'i');
        filter.$or = [{ title: q }, { game: q }, { map: q }];
      }

      const tournaments = await Tournament.find(filter).sort({ createdAt: -1 }).lean();
      return res.status(200).json({ success: true, count: tournaments.length, data: tournaments });
    }

    let filtered = [...fallbackTournaments];
    if (status && status !== 'all') filtered = filtered.filter(t => t.status.toLowerCase() === status.toLowerCase());
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(t => t.title.toLowerCase().includes(q) || t.game.toLowerCase().includes(q) || t.map.toLowerCase().includes(q));
    }

    return res.status(200).json({ success: true, count: filtered.length, data: filtered, note: 'Running in fallback memory mode (MongoDB offline)' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error retrieving tournaments', error: error.message });
  }
};

/**
 * GET /api/tournaments/:id
 * Get a single tournament by ID
 */
export const getTournamentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDBConnected()) {
      const tournament = await Tournament.findOne({ id }).lean();
      if (!tournament) return res.status(404).json({ success: false, message: `Tournament with ID '${id}' not found` });
      return res.status(200).json({ success: true, data: tournament });
    }

    const tournament = fallbackTournaments.find(t => t.id === id);
    if (!tournament) return res.status(404).json({ success: false, message: `Tournament with ID '${id}' not found` });
    return res.status(200).json({ success: true, data: tournament });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error retrieving tournament', error: error.message });
  }
};

/**
 * POST /api/tournaments
 * Create a new tournament
 */
export const createTournament = async (req, res) => {
  try {
    const {
      title,
      game,
      prize,
      mode,
      slots,
      slotsRemaining,
      status,
      date,
      entryFee,
      map,
      description
    } = req.body;

    if (!title || !prize) return res.status(400).json({ success: false, message: 'Title and prize pool are required.' });

    const bannerPath = req.file ? `/uploads/${req.file.filename}` : '/Bg.jpg';
    const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `tournament-${Date.now()}`;
    const prizeVal = prize.startsWith('PKR') ? prize : `PKR ${prize}`;

    const tournamentPayload = {
      id,
      title,
      game: game || 'PUBG Mobile',
      prize: prizeVal,
      mode: mode || 'Squad (4v4)',
      slots: Number(slots) || 20,
      slotsRemaining: Number(slotsRemaining ?? slots) || 20,
      status: status || 'upcoming',
      date: date || 'TBD',
      entryFee: entryFee || 'Free Entry',
      map: map || 'Erangel',
      banner: bannerPath,
      description: description || 'NEXUS ESPORTS Official PUBG Mobile Tournament.'
    };

    if (isDBConnected()) {
      const created = await Tournament.create(tournamentPayload);
      return res.status(201).json({ success: true, message: 'Tournament created successfully!', data: created });
    }

    fallbackTournaments.unshift(tournamentPayload);
    return res.status(201).json({ success: true, message: 'Tournament created successfully (Memory Fallback)!', data: tournamentPayload });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create tournament', error: error.message });
  }
};

/**
 * PUT /api/tournaments/:id
 * Update an existing tournament
 */
export const updateTournament = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDBConnected()) {
      const existing = await Tournament.findOne({ id });
      if (!existing) return res.status(404).json({ success: false, message: `Tournament with ID '${id}' not found` });

      const updates = { ...req.body };
      if (req.file) updates.banner = `/uploads/${req.file.filename}`;
      if (updates.prize && !updates.prize.startsWith('PKR')) updates.prize = `PKR ${updates.prize}`;

      const updated = await Tournament.findOneAndUpdate({ id }, updates, { new: true }).lean();
      return res.status(200).json({ success: true, message: `Tournament '${updated.title}' updated successfully`, data: updated });
    }

    const index = fallbackTournaments.findIndex(t => t.id === id);
    if (index === -1) return res.status(404).json({ success: false, message: `Tournament with ID '${id}' not found` });

    const updated = {
      ...fallbackTournaments[index],
      ...req.body,
      banner: req.file ? `/uploads/${req.file.filename}` : fallbackTournaments[index].banner
    };
    fallbackTournaments[index] = updated;
    return res.status(200).json({ success: true, message: `Tournament '${updated.title}' updated successfully`, data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update tournament', error: error.message });
  }
};

/**
 * DELETE /api/tournaments/:id
 * Delete a tournament
 */
export const deleteTournament = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDBConnected()) {
      const deleted = await Tournament.findOneAndDelete({ id }).lean();
      if (!deleted) return res.status(404).json({ success: false, message: `Tournament with ID '${id}' not found` });
      return res.status(200).json({ success: true, message: `Tournament '${deleted.title}' deleted successfully`, data: deleted });
    }

    const index = fallbackTournaments.findIndex(t => t.id === id);
    if (index === -1) return res.status(404).json({ success: false, message: `Tournament with ID '${id}' not found` });
    const deleted = fallbackTournaments.splice(index, 1)[0];
    return res.status(200).json({ success: true, message: `Tournament '${deleted.title}' deleted successfully`, data: deleted });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete tournament', error: error.message });
  }
};
