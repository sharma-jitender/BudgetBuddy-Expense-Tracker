const Income = require("../models/Income");
const Expense = require("../models/Expense");
const { isValidObjectId, Types } = require("mongoose");

exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;
    const userObjectId = new Types.ObjectId(String(userId));

    const now = Date.now();
    const sixtyDaysAgo = new Date(now - 60 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    const totalIncome = await Income.aggregate([
      { $match: { userId: userObjectId } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const totalExpense = await Expense.aggregate([
      { $match: { userId: userObjectId } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const last60DaysIncomeTransactions = await Income.find({
      userId: userObjectId,
      date: { $gte: sixtyDaysAgo },
    }).sort({ date: -1 });

    const incomeLast60Days = last60DaysIncomeTransactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );

    const last30DaysIncomeTransactions = await Income.find({
      userId: userObjectId,
      date: { $gte: thirtyDaysAgo },
    }).sort({ date: -1 });

    const incomeLast30Days = last30DaysIncomeTransactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );

    const last30DaysExpenseTransactions = await Expense.find({
      userId: userObjectId,
      date: { $gte: thirtyDaysAgo },
    }).sort({ date: -1 });

    const expensesLast30Days = last30DaysExpenseTransactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );

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
    ].sort((a, b) => b.date - a.date);

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

exports.getMonthlyData = async (req, res) => {
  try {
    const userId = req.user.id;
    const userObjectId = new Types.ObjectId(String(userId));
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const monthlyData = [];

    for (let month = 0; month < 12; month++) {
      const startOfMonth = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
      const nextMonth = new Date(Date.UTC(year, month + 1, 1, 0, 0, 0, 0));

      const monthlyIncome = await Income.find({
        userId: userObjectId,
        date: {
          $gte: startOfMonth,
          $lt: nextMonth,
        },
      });

      const monthlyExpenses = await Expense.find({
        userId: userObjectId,
        date: {
          $gte: startOfMonth,
          $lt: nextMonth,
        },
      });

      const totalIncome = monthlyIncome.reduce((sum, item) => sum + item.amount, 0);
      const totalExpense = monthlyExpenses.reduce((sum, item) => sum + item.amount, 0);

      monthlyData.push({
        month: month + 1,
        monthName: new Date(year, month).toLocaleDateString("en-US", { month: "short" }),
        income: totalIncome,
        expense: totalExpense,
        balance: totalIncome - totalExpense,
      });
    }

    res.json({
      year,
      data: monthlyData,
    });
  } catch (error) {
    console.error("Error fetching monthly data:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
