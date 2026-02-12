const express = require("express");
const router = express.Router();
const {
  getCurrentBudgetLimit,
  setBudgetLimit,
  getBudgetLimitByMonth,
  deleteBudgetLimit,
  checkBudgetBeforeExpense,
} = require("../controllers/budgetLimitController");
const { protect } = require("../middleware/authMiddleware");

// Get current month's budget limit
router.get("/current", protect, getCurrentBudgetLimit);

// Set budget limit for current month
router.post("/set", protect, setBudgetLimit);

// Get budget limit for a specific month
router.get("/month/:month", protect, getBudgetLimitByMonth);

// Delete budget limit for a specific month
router.delete("/month/:month", protect, deleteBudgetLimit);

// Check if adding an expense would exceed budget
router.post("/check-expense", protect, checkBudgetBeforeExpense);

module.exports = router;
