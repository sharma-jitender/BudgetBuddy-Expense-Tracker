const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
      default: 'monthly',
    },
    nextBillingDate: {
      type: Date,
      required: true,
    },
    category: {
      type: String,
      default: 'Subscription',
    },
    merchantName: {
      type: String,
    },
    icon: {
      type: String,
      default: '💳',
    },
    detectionMethod: {
      type: String,
      enum: ['auto', 'manual'],
      default: 'auto',
    },
    relatedExpenses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Expense',
      },
    ],
    status: {
      type: String,
      enum: ['active', 'cancelled'],
      default: 'active',
    },
    reminderEnabled: {
      type: Boolean,
      default: true,
    },
    reminderDaysBefore: {
      type: Number,
      default: 3,
    },
    lastReminderSent: {
      type: Date,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
    occurrenceCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subscription', SubscriptionSchema);