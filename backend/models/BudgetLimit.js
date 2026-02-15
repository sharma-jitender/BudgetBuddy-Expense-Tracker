const mongoose = require("mongoose");

const BudgetLimitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    month: {
      type: String,
      required: true,
    },
    overallLimit: {
      type: Number,
      required: true,
      min: 0,
    },
    categoryLimits: [
      {
        category: {
          type: String,
          required: true,
        },
        limit: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

BudgetLimitSchema.index({ userId: 1, month: 1 }, { unique: true });

module.exports = mongoose.model("BudgetLimit", BudgetLimitSchema);
