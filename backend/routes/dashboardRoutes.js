 const express = require("express");
const  { protect } = require ("../middleware/authMiddleware");
const { getDashboardData, getMonthlyData } = require("../controllers/dashboardController");

const router =  express.Router();

router.get("/", protect, getDashboardData);
router.get("/monthly", protect, getMonthlyData);

module.exports = router; 