const prisma = require("../config/prismaClient");

exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;

    const now = Date.now();
    const sixtyDaysAgo = new Date(now - 60 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    const totalIncomeAgg = await prisma.income.aggregate({
      where: { userId },
      _sum: { amount: true },
    });

    const totalExpenseAgg = await prisma.expense.aggregate({
      where: { userId },
      _sum: { amount: true },
    });

    const last60DaysIncomeTransactions = await prisma.income.findMany({
      where: { userId, date: { gte: sixtyDaysAgo } },
      orderBy: { date: "desc" },
    });

    const incomeLast60Days = last60DaysIncomeTransactions.reduce(
      (sum, txn) => sum + Number(txn.amount),
      0
    );

    const last30DaysIncomeTransactions = await prisma.income.findMany({
      where: { userId, date: { gte: thirtyDaysAgo } },
      orderBy: { date: "desc" },
    });

    const incomeLast30Days = last30DaysIncomeTransactions.reduce(
      (sum, txn) => sum + Number(txn.amount),
      0
    );

    const last30DaysExpenseTransactions = await prisma.expense.findMany({
      where: { userId, date: { gte: thirtyDaysAgo } },
      orderBy: { date: "desc" },
    });

    const expensesLast30Days = last30DaysExpenseTransactions.reduce(
      (sum, txn) => sum + Number(txn.amount),
      0
    );

    const recentIncome = await prisma.income.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 5,
    });

    const recentExpense = await prisma.expense.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 5,
    });

    const lastTransaction = [
      ...recentIncome.map((txn) => ({ ...txn, type: "income" })),
      ...recentExpense.map((txn) => ({ ...txn, type: "expense" })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    const totalIncome = Number(totalIncomeAgg._sum.amount || 0);
    const totalExpense = Number(totalExpenseAgg._sum.amount || 0);

    res.json({
      totalBalance: totalIncome - totalExpense,
      totalIncome,
      totalExpense,
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
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getMonthlyData = async (req, res) => {
  try {
    const userId = req.user.id;
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const monthlyData = [];

    for (let month = 0; month < 12; month++) {
      const startOfMonth = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
      const nextMonth = new Date(Date.UTC(year, month + 1, 1, 0, 0, 0, 0));

      const monthlyIncome = await prisma.income.findMany({
        where: { userId, date: { gte: startOfMonth, lt: nextMonth } },
      });

      const monthlyExpenses = await prisma.expense.findMany({
        where: { userId, date: { gte: startOfMonth, lt: nextMonth } },
      });

      const totalIncome = monthlyIncome.reduce((sum, item) => sum + Number(item.amount), 0);
      const totalExpense = monthlyExpenses.reduce((sum, item) => sum + Number(item.amount), 0);

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