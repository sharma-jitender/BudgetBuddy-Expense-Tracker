const BudgetLimit = require("../models/BudgetLimit");
const Expense = require("../models/Expense");
const { Types } = require("mongoose");

// Get current month's budget limit
exports.getCurrentBudgetLimit = async (req, res) => {
  try {
    const userId = req.user.id;
    const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM" format

    let budgetLimit = await BudgetLimit.findOne({
      userId: new Types.ObjectId(userId),
      month: currentMonth,
      isActive: true,
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

    // Calculate current spending for the month
    const startOfMonth = new Date(currentMonth + "-01");
    const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0);

    const expenses = await Expense.find({
      userId: new Types.ObjectId(userId),
      date: {
        $gte: startOfMonth,
        $lte: endOfMonth,
      },
    });

    const currentSpending = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    // Calculate category-wise spending
    const categorySpending = {};
    expenses.forEach((expense) => {
      if (categorySpending[expense.category]) {
        categorySpending[expense.category] += expense.amount;
      } else {
        categorySpending[expense.category] = expense.amount;
      }
    });

    // Calculate progress percentages
    const overallProgress = budgetLimit.overallLimit > 0 ? (currentSpending / budgetLimit.overallLimit) * 100 : 0;
    const isOverBudget = currentSpending > budgetLimit.overallLimit;

    res.json({
      ...budgetLimit.toObject(),
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

// Create or update budget limit
exports.setBudgetLimit = async (req, res) => {
  try {
    const userId = req.user.id;
    const { overallLimit, categoryLimits } = req.body;
    const currentMonth = new Date().toISOString().slice(0, 7);

    // Validation
    if (!overallLimit || overallLimit < 0) {
      return res.status(400).json({ message: "Overall limit must be a positive number" });
    }

    if (categoryLimits && !Array.isArray(categoryLimits)) {
      return res.status(400).json({ message: "Category limits must be an array" });
    }

    // Validate category limits
    if (categoryLimits) {
      for (const catLimit of categoryLimits) {
        if (!catLimit.category || !catLimit.limit || catLimit.limit < 0) {
          return res.status(400).json({ 
            message: "Each category limit must have a valid category name and positive limit" 
          });
        }
      }
    }

    // Check if total category limits don't exceed overall limit
    if (categoryLimits) {
      const totalCategoryLimits = categoryLimits.reduce((sum, cat) => sum + cat.limit, 0);
      if (totalCategoryLimits > overallLimit) {
        return res.status(400).json({ 
          message: "Total category limits cannot exceed overall budget limit" 
        });
      }
    }

    // Upsert budget limit
    const budgetLimit = await BudgetLimit.findOneAndUpdate(
      {
        userId: new Types.ObjectId(userId),
        month: currentMonth,
      },
      {
        overallLimit,
        categoryLimits: categoryLimits || [],
        isActive: true,
      },
      {
        upsert: true,
        new: true,
      }
    );

    res.json(budgetLimit);
  } catch (error) {
    console.error("Error setting budget limit:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get budget limit for a specific month
exports.getBudgetLimitByMonth = async (req, res) => {
  try {
    const userId = req.user.id;
    const { month } = req.params; // Format: "YYYY-MM"

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ message: "Invalid month format. Use YYYY-MM" });
    }

    const budgetLimit = await BudgetLimit.findOne({
      userId: new Types.ObjectId(userId),
      month,
      isActive: true,
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

    // Calculate spending for the specified month
    const startOfMonth = new Date(month + "-01");
    const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0);

    const expenses = await Expense.find({
      userId: new Types.ObjectId(userId),
      date: {
        $gte: startOfMonth,
        $lte: endOfMonth,
      },
    });

    const currentSpending = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    // Calculate category-wise spending
    const categorySpending = {};
    expenses.forEach((expense) => {
      if (categorySpending[expense.category]) {
        categorySpending[expense.category] += expense.amount;
      } else {
        categorySpending[expense.category] = expense.amount;
      }
    });

    const overallProgress = budgetLimit.overallLimit > 0 ? (currentSpending / budgetLimit.overallLimit) * 100 : 0;
    const isOverBudget = currentSpending > budgetLimit.overallLimit;

    res.json({
      ...budgetLimit.toObject(),
      currentSpending,
      categorySpending,
      isOverBudget,
      overallProgress: Math.round(overallProgress * 100) / 100,
    });
  } catch (error) {
    console.error("Error fetching budget limit by month:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Delete budget limit
exports.deleteBudgetLimit = async (req, res) => {
  try {
    const userId = req.user.id;
    const { month } = req.params;

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ message: "Invalid month format. Use YYYY-MM" });
    }

    const result = await BudgetLimit.findOneAndDelete({
      userId: new Types.ObjectId(userId),
      month,
    });

    if (!result) {
      return res.status(404).json({ message: "Budget limit not found" });
    }

    res.json({ message: "Budget limit deleted successfully" });
  } catch (error) {
    console.error("Error deleting budget limit:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Check if adding an expense would exceed budget
exports.checkBudgetBeforeExpense = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, category } = req.body;
    const currentMonth = new Date().toISOString().slice(0, 7);

    const budgetLimit = await BudgetLimit.findOne({
      userId: new Types.ObjectId(userId),
      month: currentMonth,
      isActive: true,
    });

    if (!budgetLimit) {
      return res.json({ 
        canAdd: true, 
        warnings: [],
        overallProgress: 0,
        categoryProgress: 0 
      });
    }

    // Calculate current spending
    const startOfMonth = new Date(currentMonth + "-01");
    const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0);

    const expenses = await Expense.find({
      userId: new Types.ObjectId(userId),
      date: {
        $gte: startOfMonth,
        $lte: endOfMonth,
      },
    });

    const currentSpending = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const newTotalSpending = currentSpending + amount;

    // Calculate category spending
    const categorySpending = expenses
      .filter(expense => expense.category === category)
      .reduce((sum, expense) => sum + expense.amount, 0);
    const newCategorySpending = categorySpending + amount;

    const warnings = [];
    let canAdd = true;

    // Check overall budget
    const overallProgress = (newTotalSpending / budgetLimit.overallLimit) * 100;
    if (newTotalSpending > budgetLimit.overallLimit) {
      warnings.push(`This expense would exceed your overall monthly budget by $${(newTotalSpending - budgetLimit.overallLimit).toFixed(2)}`);
      canAdd = false;
    } else if (overallProgress > 90) {
      warnings.push(`This expense would use ${overallProgress.toFixed(1)}% of your monthly budget`);
    }

    // Check category budget
    const categoryLimit = budgetLimit.categoryLimits.find(cat => cat.category === category);
    if (categoryLimit) {
      const categoryProgress = (newCategorySpending / categoryLimit.limit) * 100;
      if (newCategorySpending > categoryLimit.limit) {
        warnings.push(`This expense would exceed your ${category} budget by $${(newCategorySpending - categoryLimit.limit).toFixed(2)}`);
        canAdd = false;
      } else if (categoryProgress > 90) {
        warnings.push(`This expense would use ${categoryProgress.toFixed(1)}% of your ${category} budget`);
      }
    }

    res.json({
      canAdd,
      warnings,
      overallProgress: Math.round(overallProgress * 100) / 100,
      categoryProgress: categoryLimit ? Math.round((newCategorySpending / categoryLimit.limit) * 100 * 100) / 100 : 0,
    });
  } catch (error) {
    console.error("Error checking budget:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
