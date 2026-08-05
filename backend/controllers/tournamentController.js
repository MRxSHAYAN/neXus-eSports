import Tournament from '../models/Tournament.js';
import { isDBConnected } from '../config/db.js';

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
];

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

    let list = [...fallbackTournaments];
    if (status && status !== 'all')
      list = list.filter(t => t.status.toLowerCase() === status.toLowerCase());
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.game.toLowerCase().includes(q) ||
        t.map.toLowerCase().includes(q)
      );
    }

    return res.status(200).json({ success: true, count: list.length, data: list });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve tournaments', error: err.message });
  }
};

export const getTournamentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDBConnected()) {
      const t = await Tournament.findOne({ id }).lean();
      if (!t) return res.status(404).json({ success: false, message: `Tournament '${id}' not found` });
      return res.status(200).json({ success: true, data: t });
    }

    const t = fallbackTournaments.find(t => t.id === id);
    if (!t) return res.status(404).json({ success: false, message: `Tournament '${id}' not found` });
    return res.status(200).json({ success: true, data: t });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve tournament', error: err.message });
  }
};

export const createTournament = async (req, res) => {
  try {
    const { title, game, prize, mode, slots, slotsRemaining, status, date, entryFee, map, description } = req.body;

    if (!title || !prize) return res.status(400).json({ success: false, message: 'Title and prize are required' });

    const id         = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `tournament-${Date.now()}`;
    const bannerPath = req.file ? `/uploads/${req.file.filename}` : '/Bg.jpg';
    const prizeVal   = prize.startsWith('PKR') ? prize : `PKR ${prize}`;

    const payload = {
      id,
      title,
      game:           game || 'PUBG Mobile',
      prize:          prizeVal,
      mode:           mode || 'Squad (4v4)',
      slots:          Number(slots) || 20,
      slotsRemaining: Number(slotsRemaining ?? slots) || 20,
      status:         status || 'upcoming',
      date:           date || 'TBD',
      entryFee:       entryFee || 'Free Entry',
      map:            map || 'Erangel',
      banner:         bannerPath,
      description:    description || '',
    };

    if (isDBConnected()) {
      const created = await Tournament.create(payload);
      return res.status(201).json({ success: true, message: 'Tournament created', data: created });
    }

    fallbackTournaments.unshift(payload);
    return res.status(201).json({ success: true, message: 'Tournament created', data: payload });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create tournament', error: err.message });
  }
};

export const updateTournament = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDBConnected()) {
      if (!await Tournament.findOne({ id }))
        return res.status(404).json({ success: false, message: `Tournament '${id}' not found` });

      const updates = { ...req.body };
      if (req.file) updates.banner = `/uploads/${req.file.filename}`;
      if (updates.prize && !updates.prize.startsWith('PKR')) updates.prize = `PKR ${updates.prize}`;

      const updated = await Tournament.findOneAndUpdate({ id }, updates, { new: true }).lean();
      return res.status(200).json({ success: true, message: 'Tournament updated', data: updated });
    }

    const idx = fallbackTournaments.findIndex(t => t.id === id);
    if (idx === -1) return res.status(404).json({ success: false, message: `Tournament '${id}' not found` });

    fallbackTournaments[idx] = {
      ...fallbackTournaments[idx],
      ...req.body,
      banner: req.file ? `/uploads/${req.file.filename}` : fallbackTournaments[idx].banner,
    };
    return res.status(200).json({ success: true, message: 'Tournament updated', data: fallbackTournaments[idx] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update tournament', error: err.message });
  }
};

export const deleteTournament = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDBConnected()) {
      const deleted = await Tournament.findOneAndDelete({ id }).lean();
      if (!deleted) return res.status(404).json({ success: false, message: `Tournament '${id}' not found` });
      return res.status(200).json({ success: true, message: 'Tournament deleted', data: deleted });
    }

    const idx = fallbackTournaments.findIndex(t => t.id === id);
    if (idx === -1) return res.status(404).json({ success: false, message: `Tournament '${id}' not found` });

    const deleted = fallbackTournaments.splice(idx, 1)[0];
    return res.status(200).json({ success: true, message: 'Tournament deleted', data: deleted });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete tournament', error: err.message });
  }
};
