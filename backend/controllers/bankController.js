import BankDetails from '../models/BankDetails.js';
import { isDBConnected } from '../config/db.js';

// In-memory fallback
let inMemoryBank = {
  jazzcash: {
    method: 'JazzCash',
    accountName: 'NEXUS ESPORTS',
    accountNumber: '0300-0000000',
    instructions: 'Send entry fee via JazzCash Mobile Wallet.',
    status: 'active',
  },
  easypaisa: {
    method: 'EasyPaisa',
    accountName: 'NEXUS ESPORTS',
    accountNumber: '0333-0000000',
    instructions: 'Send entry fee via EasyPaisa Mobile Wallet.',
    status: 'active',
  },
  sadapay: {
    method: 'SadaPay',
    accountName: 'NEXUS ESPORTS',
    accountNumber: 'PK00SADA0000000000000000',
    ibanTitle: 'PK00SADA0000000000000000',
    instructions: 'Send IBFT to SadaPay. Include squad name in remarks.',
    status: 'active',
  },
};

export const getBankDetails = async (req, res) => {
  try {
    if (isDBConnected()) {
      let doc = await BankDetails.findOne().lean();
      if (!doc) {
        doc = await BankDetails.create({});
      }
      return res.status(200).json({
        success: true,
        data: {
          jazzcash: {
            method: 'JazzCash',
            accountName: doc.jazzcashTitle,
            accountNumber: doc.jazzcashNumber,
            instructions: doc.jazzcashInstructions,
          },
          easypaisa: {
            method: 'EasyPaisa',
            accountName: doc.easypaisaTitle,
            accountNumber: doc.easypaisaNumber,
            instructions: doc.easypaisaInstructions,
          },
          sadapay: {
            method: 'SadaPay',
            accountName: doc.sadapayTitle,
            accountNumber: doc.sadapayNumber,
            ibanTitle: doc.sadapayNumber,
            instructions: doc.sadapayInstructions,
          },
        },
      });
    }

    return res.status(200).json({ success: true, data: inMemoryBank });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve bank details', error: err.message });
  }
};

export const updateBankDetails = async (req, res) => {
  try {
    const incoming = req.body;
    if (!incoming || Object.keys(incoming).length === 0) {
      return res.status(400).json({ success: false, message: 'No bank details provided' });
    }

    const jz = incoming.jazzcash || incoming.JazzCash || {};
    const ep = incoming.easypaisa || incoming.EasyPaisa || {};
    const sp = incoming.sadapay || incoming.SadaPay || {};

    if (isDBConnected()) {
      const update = {};
      if (jz.accountName)  update.jazzcashTitle  = jz.accountName;
      if (jz.accountNumber) update.jazzcashNumber = jz.accountNumber;
      if (jz.instructions) update.jazzcashInstructions = jz.instructions;
      if (ep.accountName)  update.easypaisaTitle  = ep.accountName;
      if (ep.accountNumber) update.easypaisaNumber = ep.accountNumber;
      if (ep.instructions) update.easypaisaInstructions = ep.instructions;
      if (sp.accountName)  update.sadapayTitle  = sp.accountName;
      if (sp.accountNumber || sp.ibanTitle) update.sadapayNumber = sp.accountNumber || sp.ibanTitle;
      if (sp.instructions) update.sadapayInstructions = sp.instructions;

      const doc = await BankDetails.findOneAndUpdate({}, { $set: update }, { new: true, upsert: true }).lean();
      return res.status(200).json({ success: true, message: 'Bank details updated', data: doc });
    }

    // In-memory fallback
    if (Object.keys(jz).length) inMemoryBank.jazzcash = { ...inMemoryBank.jazzcash, ...jz };
    if (Object.keys(ep).length) inMemoryBank.easypaisa = { ...inMemoryBank.easypaisa, ...ep };
    if (Object.keys(sp).length) inMemoryBank.sadapay = { ...inMemoryBank.sadapay, ...sp };

    return res.status(200).json({ success: true, message: 'Bank details updated', data: inMemoryBank });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update bank details', error: err.message });
  }
};
