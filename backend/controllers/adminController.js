import { isDBConnected } from '../config/db.js';
import Team from '../models/Team.js';

const fallbackStats = {
  totalTeams: 4,
  approvedTeams: 2,
  pendingTeams: 2,
  rejectedTeams: 0,
  totalRevenuePKR: 175,
};

export const getAdminStats = async (req, res) => {
  try {
    let totalTeams, approvedTeams, pendingTeams, rejectedTeams, totalRevenuePKR;

    if (isDBConnected()) {
      const [total, approved, pending, rejected, approvedList] = await Promise.all([
        Team.countDocuments(),
        Team.countDocuments({ status: 'approved' }),
        Team.countDocuments({ status: 'pending' }),
        Team.countDocuments({ status: 'rejected' }),
        Team.find({ status: 'approved' }, 'entryFee').lean(),
      ]);
      totalTeams      = total;
      approvedTeams   = approved;
      pendingTeams    = pending;
      rejectedTeams   = rejected;
      totalRevenuePKR = approvedList.reduce((sum, t) => {
        const match = (t.entryFee || '').match(/(\d+)/);
        return sum + (match ? parseInt(match[1], 10) : 0);
      }, 0);
    } else {
      ({ totalTeams, approvedTeams, pendingTeams, rejectedTeams, totalRevenuePKR } = fallbackStats);
    }

    return res.status(200).json({
      success: true,
      data: {
        totalTeams,
        approvedTeams,
        pendingTeams,
        rejectedTeams,
        totalRevenuePKR,
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load stats', error: err.message });
  }
};
