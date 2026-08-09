import { isDBConnected } from '../config/db.js';
import Team from '../models/Team.js';

export const getAdminStats = async (req, res) => {
  try {
    let totalTeams = 0, approvedTeams = 0, pendingTeams = 0, rejectedTeams = 0, totalRevenuePKR = 0;

    if (isDBConnected()) {
      const [total, approved, pending, rejected, approvedList] = await Promise.all([
        Team.countDocuments(),
        Team.countDocuments({ status: 'Approved' }),
        Team.countDocuments({ status: 'Pending' }),
        Team.countDocuments({ status: 'Rejected' }),
        Team.find({ status: 'Approved' }, 'entryFee').lean(),
      ]);
      totalTeams    = total;
      approvedTeams = approved;
      pendingTeams  = pending;
      rejectedTeams = rejected;
      totalRevenuePKR = approvedList.reduce((sum, t) => {
        const match = (t.entryFee || '').match(/(\d+)/);
        return sum + (match ? parseInt(match[1], 10) : 0);
      }, 0);
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
