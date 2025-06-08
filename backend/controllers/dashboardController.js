const Income = require("../models/Income");
const Expense = require("../models/Expense");
const { isValidObjectId, Types } = require("mongoose");

// Dashboard Data
exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;
    const userObjectId = new Types.ObjectId(String(userId));

    // Date calculations for clarity
    const now = Date.now();
    const sixtyDaysAgo = new Date(now - 60 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    // Fetch total income and expenses for the user
    const totalIncome = await Income.aggregate([
      { $match: { userId: userObjectId } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const totalExpense = await Expense.aggregate([
      { $match: { userId: userObjectId } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    // Get income transactions for the last 60 days
    const last60DaysIncomeTransactions = await Income.find({
      userId: userObjectId,
      date: { $gte: sixtyDaysAgo },
    }).sort({ date: -1 });

    // Calculate total income for the last 60 days
    const incomeLast60Days = last60DaysIncomeTransactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );

    // Get income transactions for the last 30 days
    const last30DaysIncomeTransactions = await Income.find({
      userId: userObjectId,
      date: { $gte: thirtyDaysAgo },
    }).sort({ date: -1 });

    // Get total income for the last 30 days
    const incomeLast30Days = last30DaysIncomeTransactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );

    // Get expense transactions for the last 30 days
    const last30DaysExpenseTransactions = await Expense.find({
      userId: userObjectId,
      date: { $gte: thirtyDaysAgo },
    }).sort({ date: -1 });

    // Get total expenses for the last 30 days
    const expensesLast30Days = last30DaysExpenseTransactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );

    // Get the last 5 income and expense transactions
    const lastTransaction = [
      ...(await Income.find({ userId: userObjectId }).sort({ date: -1 }).limit(5)).map(
        (txn) => ({
          ...txn.toObject(),
          type: "income",
        })
      ),
      ...(await Expense.find({ userId: userObjectId }).sort({ date: -1 }).limit(5)).map(
        (txn) => ({
          ...txn.toObject(),
          type: "expense",
        })
      ),
    ].sort((a, b) => b.date - a.date); // Sort by date descending

    // Final response
    res.json({
      totalBalance:
        (totalIncome[0]?.total || 0) - (totalExpense[0]?.total || 0),
      totalIncome: totalIncome[0]?.total || 0,
      totalExpense: totalExpense[0]?.total || 0,
      last30DaysExpenses: {
        total: expensesLast30Days,
        transactions: last30DaysExpenseTransactions,
      },
      last60DaysIncome: {
        total: incomeLast60Days,
        transactions: last60DaysIncomeTransactions,
      },
      last30DaysIncome: {
        total: incomeLast30Days,
        transactions: last30DaysIncomeTransactions,
      },
      recentTransactions: lastTransaction,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
