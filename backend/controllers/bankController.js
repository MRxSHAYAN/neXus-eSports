let bankDetails = {
  jazzcash: {
    method: 'JazzCash',
    accountName: 'NEXUS ESPORTS',
    accountNumber: '0300-0000000',
    ibanTitle: '',
    instructions: 'Send entry fee via JazzCash and attach the receipt screenshot.',
    status: 'active',
    updatedAt: new Date().toISOString(),
  },
  easypaisa: {
    method: 'EasyPaisa',
    accountName: 'NEXUS ESPORTS',
    accountNumber: '0333-0000000',
    ibanTitle: '',
    instructions: 'Send entry fee via EasyPaisa and attach the receipt screenshot.',
    status: 'active',
    updatedAt: new Date().toISOString(),
  },
  sadapay: {
    method: 'SadaPay',
    accountName: 'NEXUS ESPORTS',
    accountNumber: '',
    ibanTitle: 'PK00SADA0000000000000000',
    instructions: 'Send IBFT transfer to SadaPay and include your squad name in remarks.',
    status: 'active',
    updatedAt: new Date().toISOString(),
  },
};

export const getBankDetails = async (req, res) => {
  try {
    return res.status(200).json({ success: true, data: bankDetails });
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

    Object.keys(incoming).forEach(key => {
      const k = key.toLowerCase();
      bankDetails[k] = { ...bankDetails[k], ...incoming[key], updatedAt: new Date().toISOString() };
    });

    return res.status(200).json({ success: true, message: 'Bank details updated', data: bankDetails });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update bank details', error: err.message });
  }
};
