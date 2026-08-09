import BankDetails from '../models/BankDetails.js';
import { isDBConnected } from '../config/db.js';

// In-memory fallback — exactly 2 accounts
let inMemoryBank = {
  account1: { provider: 'JazzCash',  title: 'NEXUS ESPORTS', number: '' },
  account2: { provider: 'EasyPaisa', title: 'NEXUS ESPORTS', number: '' },
};

// ── GET /api/bank ─────────────────────────────────────────────────────────
export const getBankDetails = async (req, res) => {
  try {
    if (isDBConnected()) {
      let doc = await BankDetails.findOne().lean();
      if (!doc) {
        // Create the singleton with defaults
        doc = await BankDetails.create({});
        doc = doc.toObject ? doc.toObject() : doc;
      }

      return res.status(200).json({
        success: true,
        data: {
          account1: {
            provider: doc.account1Provider || 'JazzCash',
            title:    doc.account1Title    || 'NEXUS ESPORTS',
            number:   doc.account1Number   || '',
          },
          account2: {
            provider: doc.account2Provider || 'EasyPaisa',
            title:    doc.account2Title    || 'NEXUS ESPORTS',
            number:   doc.account2Number   || '',
          },
        },
      });
    }

    return res.status(200).json({ success: true, data: inMemoryBank });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve bank details', error: err.message });
  }
};

// ── PUT /api/bank ─────────────────────────────────────────────────────────
export const updateBankDetails = async (req, res) => {
  try {
    const { account1, account2 } = req.body;
    if (!account1 && !account2) {
      return res.status(400).json({ success: false, message: 'No bank details provided' });
    }

    if (isDBConnected()) {
      const update = {};
      if (account1) {
        if (account1.provider) update.account1Provider = account1.provider;
        if (account1.title)    update.account1Title    = account1.title;
        if (account1.number)   update.account1Number   = account1.number;
      }
      if (account2) {
        if (account2.provider) update.account2Provider = account2.provider;
        if (account2.title)    update.account2Title    = account2.title;
        if (account2.number)   update.account2Number   = account2.number;
      }

      const doc = await BankDetails.findOneAndUpdate({}, { $set: update }, { new: true, upsert: true }).lean();

      return res.status(200).json({
        success: true,
        message: 'Bank details updated',
        data: {
          account1: {
            provider: doc.account1Provider,
            title:    doc.account1Title,
            number:   doc.account1Number,
          },
          account2: {
            provider: doc.account2Provider,
            title:    doc.account2Title,
            number:   doc.account2Number,
          },
        },
      });
    }

    // In-memory fallback
    if (account1) inMemoryBank.account1 = { ...inMemoryBank.account1, ...account1 };
    if (account2) inMemoryBank.account2 = { ...inMemoryBank.account2, ...account2 };

    return res.status(200).json({ success: true, message: 'Bank details updated', data: inMemoryBank });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update bank details', error: err.message });
  }
};
