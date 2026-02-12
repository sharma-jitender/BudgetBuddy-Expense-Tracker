const mongoose = require('mongoose');

const plaidItemSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  accessToken: {
    type: String,
    required: true,
    // IMPORTANT: In production, encrypt this!
  },
  itemId: {
    type: String,
    required: true,
    unique: true,
  },
  institutionId: {
    type: String,
  },
  institutionName: {
    type: String,
  },
  accounts: [{
    accountId: String,
    name: String,
    type: String,
    subtype: String,
    mask: String,
  }],
  lastSynced: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'error'],
    default: 'active',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('PlaidItem', plaidItemSchema);