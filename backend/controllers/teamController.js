import Team from '../models/Team.js';
import { isDBConnected } from '../config/db.js';

let fallbackTeams = [
  {
    id: 'team-001',
    name: 'ALPHA SQUAD',
    tournament: 'NEXUS OPEN CUP #12',
    captain: 'AlphaLeader',
    discord: 'AlphaLeader#1234',
    whatsapp: '+92 300 1234567',
    players: ['AlphaLeader|5123456789','AlphaSlayer|5123456790','AlphaSniper|5123456791','AlphaScout|5123456792'],
    date: 'Aug 02, 2026',
    status: 'approved',
    paymentMethod: 'free',
    transactionId: 'FREE-ENTRY',
    paymentProof: '',
    entryFee: 'Free Entry',
    logo: null,
  },
  {
    id: 'team-002',
    name: 'NOVA ESPORTS',
    tournament: 'WEEKEND WARRIOR S3',
    captain: 'NovaPrime',
    discord: 'NovaPrime#9988',
    whatsapp: '+92 312 9876543',
    players: ['NovaPrime|5234567891','NovaGhost|5234567892','NovaShadow|5234567893','NovaVenom|5234567894'],
    date: 'Aug 03, 2026',
    status: 'pending',
    paymentMethod: 'jazzcash',
    transactionId: 'TXN987654321',
    paymentProof: '',
    entryFee: 'PKR 100 / Squad',
    logo: null,
  },
  {
    id: 'team-003',
    name: 'SOUL WARRIORS',
    tournament: 'NEXUS OPEN CUP #12',
    captain: 'SoulMortal',
    discord: 'Mortal#0001',
    whatsapp: '+92 333 4445556',
    players: ['SoulMortal|5345678901','SoulViper|5345678902','SoulRegaltos|5345678903','SoulAman|5345678904'],
    date: 'Aug 04, 2026',
    status: 'approved',
    paymentMethod: 'free',
    transactionId: 'FREE-ENTRY',
    paymentProof: '',
    entryFee: 'Free Entry',
    logo: null,
  },
];

export const getAllTeams = async (req, res) => {
  try {
    const { status, tournament, search } = req.query;

    if (isDBConnected()) {
      const filter = {};
      if (status && status !== 'all')         filter.status     = new RegExp(`^${status}$`, 'i');
      if (tournament && tournament !== 'all') filter.tournament = new RegExp(tournament, 'i');
      if (search) {
        const q = new RegExp(search, 'i');
        filter.$or = [{ name: q }, { captain: q }, { id: q }];
      }
      const teams = await Team.find(filter).sort({ createdAt: -1 }).lean();
      return res.status(200).json({ success: true, count: teams.length, data: teams });
    }

    let list = [...fallbackTeams];
    if (status && status !== 'all')
      list = list.filter(t => t.status.toLowerCase() === status.toLowerCase());
    if (tournament && tournament !== 'all')
      list = list.filter(t => t.tournament.toLowerCase().includes(tournament.toLowerCase()));
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(t => t.name.toLowerCase().includes(q) || t.captain.toLowerCase().includes(q));
    }

    return res.status(200).json({ success: true, count: list.length, data: list });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve teams', error: err.message });
  }
};

export const getTeamById = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDBConnected()) {
      const team = await Team.findOne({ id }).lean();
      if (team) return res.status(200).json({ success: true, data: team });
    }

    const team = fallbackTeams.find(t => t.id === id);
    if (!team) return res.status(404).json({ success: false, message: `Team '${id}' not found` });
    return res.status(200).json({ success: true, data: team });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve team', error: err.message });
  }
};

export const registerTeam = async (req, res) => {
  try {
    const {
      name, team_name, tournament, captain, discord, whatsapp,
      players, paymentMethod, transactionId, entryFee, substitute,
    } = req.body;

    const squadName = (name || team_name || '').toUpperCase().trim();
    if (!squadName) return res.status(400).json({ success: false, message: 'Team name is required' });

    let parsedPlayers = [];
    if (Array.isArray(players)) {
      parsedPlayers = players;
    } else if (typeof players === 'string') {
      try { parsedPlayers = JSON.parse(players); } catch { parsedPlayers = [players]; }
    }
    if (parsedPlayers.length === 0) {
      parsedPlayers = [1, 2, 3, 4].map(n =>
        `${req.body[`player${n}_ign`] || `Player${n}`}|${req.body[`player${n}_uid`] || '00000000'}`
      );
    }

    const proofPath     = req.file ? `/uploads/${req.file.filename}` : '';
    const teamId        = `NEXUS-${Date.now().toString().slice(-6)}`;
    const dateFormatted = new Date().toLocaleDateString('en-PK', { month: 'short', day: 'numeric', year: 'numeric' });
    const initialStatus = (!paymentMethod || paymentMethod === 'free' || !transactionId) ? 'approved' : 'pending';

    const payload = {
      id: teamId,
      name: squadName,
      tournament: tournament || 'NEXUS OPEN CUP #12',
      captain: captain || discord || 'Squad Leader',
      discord: discord || '',
      whatsapp: whatsapp || '',
      players: parsedPlayers,
      substitute: substitute || 'N/A',
      date: dateFormatted,
      status: initialStatus,
      paymentMethod: paymentMethod || 'free',
      transactionId: transactionId || 'FREE-ENTRY',
      paymentProof: proofPath,
      entryFee: entryFee || 'Free Entry',
      logo: proofPath || null,
    };

    if (isDBConnected()) {
      try { await Team.create(payload); } catch (e) { console.warn('db write error:', e.message); }
    }
    fallbackTeams.unshift(payload);

    return res.status(201).json({ success: true, message: 'Squad registered', data: payload });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to register squad', error: err.message });
  }
};

export const updateTeamStatus = async (req, res) => {
  try {
    const { id }     = req.params;
    const { status } = req.body;

    const valid = ['approved', 'pending', 'rejected'];
    if (!valid.includes(status?.toLowerCase())) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${valid.join(', ')}` });
    }

    const norm = status.toLowerCase();

    if (isDBConnected()) await Team.findOneAndUpdate({ id }, { status: norm });

    const idx = fallbackTeams.findIndex(t => t.id === id);
    if (idx !== -1) fallbackTeams[idx].status = norm;

    return res.status(200).json({ success: true, message: `Team status updated to ${norm}` });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update team status', error: err.message });
  }
};

export const deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDBConnected()) await Team.findOneAndDelete({ id });

    const idx = fallbackTeams.findIndex(t => t.id === id);
    if (idx !== -1) fallbackTeams.splice(idx, 1);

    return res.status(200).json({ success: true, message: 'Team deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete team', error: err.message });
  }
};
