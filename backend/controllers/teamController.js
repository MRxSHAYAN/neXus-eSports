import Team from '../models/Team.js';
import { isDBConnected } from '../config/db.js';

// In-memory fallback dataset in case local MongoDB is offline
let fallbackTeams = [
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
];

/**
 * GET /api/teams
 * List all teams from MongoDB (or fallback)
 */
export const getAllTeams = async (req, res) => {
  try {
    const { status, tournament, search } = req.query;

    if (isDBConnected()) {
      const filter = {};
      if (status && status !== 'all') filter.status = new RegExp(`^${status}$`, 'i');
      if (tournament && tournament !== 'all') filter.tournament = new RegExp(tournament, 'i');
      if (search) {
        const q = new RegExp(search, 'i');
        filter.$or = [{ name: q }, { captain: q }, { id: q }];
      }

      const teams = await Team.find(filter).sort({ createdAt: -1 }).lean();
      return res.status(200).json({ success: true, count: teams.length, data: teams });
    }

    // Fallback mode if DB is disconnected
    let filtered = [...fallbackTeams];
    if (status && status !== 'all') filtered = filtered.filter(t => t.status.toLowerCase() === status.toLowerCase());
    if (tournament && tournament !== 'all') filtered = filtered.filter(t => t.tournament.toLowerCase().includes(tournament.toLowerCase()));
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(t => t.name.toLowerCase().includes(q) || t.captain.toLowerCase().includes(q) || t.id.toLowerCase().includes(q));
    }

    return res.status(200).json({ success: true, count: filtered.length, data: filtered, note: 'Running in fallback memory mode (MongoDB offline)' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error retrieving teams', error: error.message });
  }
};

/**
 * GET /api/teams/:id
 * Get a specific team by ID
 */
export const getTeamById = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDBConnected()) {
      const team = await Team.findOne({ id }).lean();
      if (!team) return res.status(404).json({ success: false, message: `Team with ID '${id}' not found` });
      return res.status(200).json({ success: true, data: team });
    }

    const team = fallbackTeams.find(t => t.id === id);
    if (!team) return res.status(404).json({ success: false, message: `Team with ID '${id}' not found` });
    return res.status(200).json({ success: true, data: team });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error retrieving team', error: error.message });
  }
};

/**
 * POST /api/teams
 * Register a new squad
 */
export const registerTeam = async (req, res) => {
  try {
    const {
      name,
      team_name,
      tournament,
      captain,
      discord,
      whatsapp,
      players,
      paymentMethod,
      transactionId,
      entryFee
    } = req.body;

    const squadName = (name || team_name || '').toUpperCase().trim();
    if (!squadName) return res.status(400).json({ success: false, message: 'Team name is required.' });

    let parsedPlayers = [];
    if (Array.isArray(players)) {
      parsedPlayers = players;
    } else if (typeof players === 'string') {
      try { parsedPlayers = JSON.parse(players); } catch { parsedPlayers = [players]; }
    }

    if (parsedPlayers.length === 0) {
      parsedPlayers = [
        `${req.body.player1_ign || 'Captain'}|${req.body.player1_uid || '00000000'}`,
        `${req.body.player2_ign || 'Player2'}|${req.body.player2_uid || '00000000'}`,
        `${req.body.player3_ign || 'Player3'}|${req.body.player3_uid || '00000000'}`,
        `${req.body.player4_ign || 'Player4'}|${req.body.player4_uid || '00000000'}`
      ];
    }

    const logoPath = req.file ? `/uploads/${req.file.filename}` : null;
    const teamId = `team-${Date.now()}`;
    const dateFormatted = new Date().toLocaleDateString('en-PK', { month: 'short', day: 'numeric', year: 'numeric' });
    const statusVal = paymentMethod === 'free' || !transactionId ? 'approved' : 'pending';

    const newTeamPayload = {
      id: teamId,
      name: squadName,
      tournament: tournament || 'NEXUS OPEN CUP #12',
      captain: captain || discord || 'Squad Leader',
      discord: discord || '',
      whatsapp: whatsapp || '',
      players: parsedPlayers,
      date: dateFormatted,
      status: statusVal,
      paymentMethod: paymentMethod || 'free',
      transactionId: transactionId || 'FREE-ENTRY',
      paymentProof: logoPath || '',
      entryFee: entryFee || 'Free Entry',
      logo: logoPath
    };

    if (isDBConnected()) {
      const created = await Team.create(newTeamPayload);
      return res.status(201).json({ success: true, message: 'Squad registered successfully!', data: created });
    }

    fallbackTeams.unshift(newTeamPayload);
    return res.status(201).json({ success: true, message: 'Squad registered successfully (Memory Fallback)!', data: newTeamPayload });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to register squad', error: error.message });
  }
};

/**
 * PATCH /api/teams/:id/status
 * Update team approval status
 */
export const updateTeamStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'pending', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status. Must be 'approved', 'pending', or 'rejected'." });
    }

    if (isDBConnected()) {
      const updated = await Team.findOneAndUpdate({ id }, { status }, { new: true }).lean();
      if (!updated) return res.status(404).json({ success: false, message: `Team with ID '${id}' not found` });
      return res.status(200).json({ success: true, message: `Team '${updated.name}' status updated to ${status}`, data: updated });
    }

    const index = fallbackTeams.findIndex(t => t.id === id);
    if (index === -1) return res.status(404).json({ success: false, message: `Team with ID '${id}' not found` });
    fallbackTeams[index].status = status;
    return res.status(200).json({ success: true, message: `Team '${fallbackTeams[index].name}' status updated to ${status}`, data: fallbackTeams[index] });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update team status', error: error.message });
  }
};

/**
 * DELETE /api/teams/:id
 * Delete a registered team
 */
export const deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDBConnected()) {
      const deleted = await Team.findOneAndDelete({ id }).lean();
      if (!deleted) return res.status(404).json({ success: false, message: `Team with ID '${id}' not found` });
      return res.status(200).json({ success: true, message: `Team '${deleted.name}' removed successfully`, data: deleted });
    }

    const index = fallbackTeams.findIndex(t => t.id === id);
    if (index === -1) return res.status(404).json({ success: false, message: `Team with ID '${id}' not found` });
    const deleted = fallbackTeams.splice(index, 1)[0];
    return res.status(200).json({ success: true, message: `Team '${deleted.name}' removed successfully`, data: deleted });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete team', error: error.message });
  }
};
