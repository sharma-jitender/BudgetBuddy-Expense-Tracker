const prisma = require("../config/prismaClient");

exports.getCurrentBudgetLimit = async (req, res) => {
  try {
    const userId = req.user.id;
    const currentMonth = new Date().toISOString().slice(0, 7);

    const budgetLimit = await prisma.budget.findFirst({
      where: {
        userId,
        month: currentMonth,
        isActive: true,
      },
    });

   

    if (!budgetLimit) {
      return res.json({
        month: currentMonth,
        overallLimit: 0,
        categoryLimits: [],
        currentSpending: 0,
        categorySpending: {},
        isOverBudget: false,
        overallProgress: 0,
      });
    }

    const startOfMonth = new Date(currentMonth + "-01");
    const endOfMonth = new Date(
      startOfMonth.getFullYear(),
      startOfMonth.getMonth() + 1,
      0,
    );

    const expenses = await prisma.expense.findMany({
      where: {
        userId,
        date: { gte: startOfMonth, lte: endOfMonth },
      },
    });

    const currentSpending = expenses.reduce(
      (sum, e) => sum + Number(e.amount),
      0,
    );

    const categorySpending = {};
    expenses.forEach((expense) => {
      const amt = Number(expense.amount);
      categorySpending[expense.category] =
        (categorySpending[expense.category] || 0) + amt;
    });

    const overallLimit = Number(budgetLimit.overallLimit);
    const overallProgress =
      overallLimit > 0 ? (currentSpending / overallLimit) * 100 : 0;
    const isOverBudget = currentSpending > overallLimit;

    res.json({
      ...budgetLimit,
      overallLimit,
      currentSpending,
      categorySpending,
      isOverBudget,
      overallProgress: Math.round(overallProgress * 100) / 100,
    });
  } catch (error) {
    console.error("Error fetching budget limit:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.setBudgetLimit = async (req, res) => {
  try {
    const userId = req.user.id;
    const { overallLimit, categoryLimits, month } = req.body;
    const selectedMonth = month || new Date().toISOString().slice(0, 7);

    if (month && !/^\d{4}-\d{2}$/.test(month)) {
      return res
        .status(400)
        .json({ message: "Invalid month format. Use YYYY-MM" });
    }

    if (!overallLimit || overallLimit < 0) {
      return res
        .status(400)
        .json({ message: "Overall limit must be a positive number" });
    }

    if (categoryLimits && !Array.isArray(categoryLimits)) {
      return res
        .status(400)
        .json({ message: "Category limits must be an array" });
    }

    if (categoryLimits) {
      for (const catLimit of categoryLimits) {
        if (!catLimit.category || !catLimit.limit || catLimit.limit < 0) {
          return res.status(400).json({
            message:
              "Each category limit must have a valid category name and positive limit",
          });
        }
      }

      const totalCategoryLimits = categoryLimits.reduce(
        (sum, cat) => sum + cat.limit,
        0,
      );
      if (totalCategoryLimits > overallLimit) {
        return res.status(400).json({
          message: "Total category limits cannot exceed overall budget limit",
        });
      }
    }

    const budgetLimit = await prisma.budget.upsert({
      where: {
        userId_month: { userId, month: selectedMonth },
      },
      update: {
        overallLimit,
        categoryLimits: categoryLimits || [],
        isActive: true,
      },
      create: {
        userId,
        month: selectedMonth,
        overallLimit,
        categoryLimits: categoryLimits || [],
        isActive: true,
      },
    });

    res.json(budgetLimit);
  } catch (error) {
    console.error("Error setting budget limit:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getBudgetLimitByMonth = async (req, res) => {
  try {
    const userId = req.user.id;
    const { month } = req.params;

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res
        .status(400)
        .json({ message: "Invalid month format. Use YYYY-MM" });
    }

    const budgetLimit = await prisma.budget.findFirst({
      where: { userId, month, isActive: true },
    });

    if (!budgetLimit) {
      return res.json({
        month,
        overallLimit: 0,
        categoryLimits: [],
        currentSpending: 0,
        categorySpending: {},
        isOverBudget: false,
        overallProgress: 0,
      });
    }

    const startOfMonth = new Date(month + "-01");
    const endOfMonth = new Date(
      startOfMonth.getFullYear(),
      startOfMonth.getMonth() + 1,
      0,
    );

    const expenses = await prisma.expense.findMany({
      where: {
        userId,
        date: { gte: startOfMonth, lte: endOfMonth },
      },
    });

    const currentSpending = expenses.reduce(
      (sum, e) => sum + Number(e.amount),
      0,
    );

    const categorySpendingTwo = {};
    expenses.forEach((expense) => {
      const amt = Number(expense.amount);
      categorySpendingTwo[expense.category] =
        (categorySpendingTwo[expense.category] || 0) + amt;
    });

    const overallLimit = Number(budgetLimit.overallLimit);
    const overallProgress =
      overallLimit > 0 ? (currentSpending / overallLimit) * 100 : 0;
    const isOverBudget = currentSpending > overallLimit;

    res.json({
      ...budgetLimit,
      overallLimit,
      currentSpending,
      categorySpending: categorySpendingTwo,
      isOverBudget,
      overallProgress: Math.round(overallProgress * 100) / 100,
    });
  } catch (error) {
    console.error("Error fetching budget limit by month:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.deleteBudgetLimit = async (req, res) => {
  try {
    const userId = req.user.id;
    const { month } = req.params;

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res
        .status(400)
        .json({ message: "Invalid month format. Use YYYY-MM" });
    }

    try {
      await prisma.budget.delete({
        where: { userId_month: { userId, month } },
      });
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ message: "Budget limit not found" });
      }
      throw err;
    }

    res.json({ message: "Budget limit deleted successfully" });
  } catch (error) {
    console.error("Error deleting budget limit:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.checkBudgetBeforeExpense = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, category } = req.body;
    const currentMonth = new Date().toISOString().slice(0, 7);

    const budgetLimit = await prisma.budget.findFirst({
      where: { userId, month: currentMonth, isActive: true },
    });

    if (!budgetLimit) {
      return res.json({
        canAdd: true,
        warnings: [],
        overallProgress: 0,
        categoryProgress: 0,
      });
    }

    const startOfMonth = new Date(currentMonth + "-01");
    const endOfMonth = new Date(
      startOfMonth.getFullYear(),
      startOfMonth.getMonth() + 1,
      0,
    );

    const expenses = await prisma.expense.findMany({
      where: {
        userId,
        date: { gte: startOfMonth, lte: endOfMonth },
      },
    });

    const currentSpending = expenses.reduce(
      (sum, e) => sum + Number(e.amount),
      0,
    );
    const newTotalSpending = currentSpending + amount;

    const categorySpending = expenses
      .filter((e) => e.category === category)
      .reduce((sum, e) => sum + Number(e.amount), 0);
    const newCategorySpending = categorySpending + amount;

    const warnings = [];
    let canAdd = true;

    const overallLimit = Number(budgetLimit.overallLimit);
    const overallProgress = (newTotalSpending / overallLimit) * 100;
    if (newTotalSpending > overallLimit) {
      warnings.push(
        `This expense would exceed your overall monthly budget by $${(newTotalSpending - overallLimit).toFixed(2)}`,
      );
      canAdd = false;
    } else if (overallProgress > 90) {
      warnings.push(
        `This expense would use ${overallProgress.toFixed(1)}% of your monthly budget`,
      );
    }

    const categoryLimits = budgetLimit.categoryLimits || [];
    const categoryLimit = categoryLimits.find(
      (cat) => cat.category === category,
    );
    let categoryProgress = 0;
    if (categoryLimit) {
      categoryProgress = (newCategorySpending / categoryLimit.limit) * 100;
      if (newCategorySpending > categoryLimit.limit) {
        warnings.push(
          `This expense would exceed your ${category} budget by $${(newCategorySpending - categoryLimit.limit).toFixed(2)}`,
        );
        canAdd = false;
      } else if (categoryProgress > 90) {
        warnings.push(
          `This expense would use ${categoryProgress.toFixed(1)}% of your ${category} budget`,
        );
      }
    }

    res.json({
      canAdd,
      warnings,
      overallProgress: Math.round(overallProgress * 100) / 100,
      categoryProgress: Math.round(categoryProgress * 100) / 100,
    });
  } catch (error) {
    console.error("Error checking budget:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
