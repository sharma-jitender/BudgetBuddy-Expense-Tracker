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

router.get("/current", protect, getCurrentBudgetLimit);

router.post("/set", protect, setBudgetLimit);

router.get("/month/:month", protect, getBudgetLimitByMonth);

router.delete("/month/:month", protect, deleteBudgetLimit);

router.post("/check-expense", protect, checkBudgetBeforeExpense);

module.exports = router;
