const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    plaidTransactionId: {
      type: String,
      unique: true,
      sparse: true,
    },
    plaidAccountId: {
      type: String,
    },
    merchantName: { type: String },
    pending: { type: Boolean, default: false },
    dataSource: {
      type: String,
      enum: ["manual", "plaid"],
      default: "manual",
    },
    icon: { type: String },
    title: { type: String, required: true }, 
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", ExpenseSchema);