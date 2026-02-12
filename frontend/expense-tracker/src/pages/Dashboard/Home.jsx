import React, { useEffect, useState, useMemo } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { useUserAuth } from "../../hooks/userUserAuth";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apipath";
import ModernInfoCard from "../../components/Cards/ModernInfoCard";
import { useNavigate } from "react-router-dom";
import { disableBudgetApi, isBudgetApiEnabled } from "../../utils/budgetApi";

import { IoMdCard } from "react-icons/io";
import { LuHandCoins, LuWalletMinimal } from "react-icons/lu";
import addThousandsSeprator from "../../utils/helper";
import ModernTransactionList from "../../components/Dashboard/ModernTransactionList";
import DonutChart from "../../components/Charts/DonutChart";
import BudgetAlert from "../../components/Dashboard/BudgetAlert";
import Last30DaysExpenses from "../../components/Dashboard/Last30DaysExpenses";

const Home = () => {
  useUserAuth();

  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [budgetData, setBudgetData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchDashboardData = async () => {
    if (loading) return;
    setLoading(true);

    try {
      // If budget API is known to be unavailable (404), don't keep calling it.
      if (!isBudgetApiEnabled()) {
        const dashboardResponse = await axiosInstance.get(API_PATHS.DASHBOARD.GET_DATA);
        if (dashboardResponse.data) setDashboardData(dashboardResponse.data);
        setBudgetData(null);
        return;
      }

      const [dashboardResult, budgetResult] = await Promise.allSettled([
        axiosInstance.get(API_PATHS.DASHBOARD.GET_DATA),
        axiosInstance.get(API_PATHS.BUDGET_LIMIT.GET_CURRENT),
      ]);

      if (dashboardResult.status === "fulfilled" && dashboardResult.value?.data) {
        setDashboardData(dashboardResult.value.data);
      }

      if (budgetResult.status === "fulfilled" && budgetResult.value?.data) {
        setBudgetData(budgetResult.value.data);
      } else if (budgetResult.status === "rejected") {
        const status = budgetResult.reason?.response?.status;
        if (status === 404) {
          // Backend doesn't have budget routes (e.g. deployed backend not updated).
          disableBudgetApi();
          setBudgetData(null);
        }
      }
    } catch (error) {
      console.log("Something went wrong. Please try again.", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Prepare donut chart data for spending breakdown
  const spendingBreakdown = useMemo(() => {
    if (!dashboardData?.last30DaysExpenses?.transactions) return [];
    
    const categoryMap = {};
    dashboardData.last30DaysExpenses.transactions.forEach((expense) => {
      if (categoryMap[expense.category]) {
        categoryMap[expense.category] += expense.amount;
      } else {
        categoryMap[expense.category] = expense.amount;
      }
    });

    return Object.entries(categoryMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6); // Top 6 categories
  }, [dashboardData]);

  return (
    <DashboardLayout activeMenu="Dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-50 mb-2">
            Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Overview of your financial activity
          </p>
        </div>

        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <ModernInfoCard
            icon={<IoMdCard />}
            title="Total Balance"
            value={addThousandsSeprator(dashboardData?.totalBalance || 0)}
            color="bg-primary"
            gradient="bg-gradient-to-br from-primary to-purple-600"
          />
          <ModernInfoCard
            icon={<LuWalletMinimal />}
            title="Total Income"
            value={addThousandsSeprator(dashboardData?.totalIncome || 0)}
            color="bg-green-500"
            gradient="bg-gradient-to-br from-green-500 to-emerald-600"
          />
          <ModernInfoCard
            icon={<LuHandCoins />}
            title="Total Expense"
            value={addThousandsSeprator(dashboardData?.totalExpense || 0)}
            color="bg-red-500"
            gradient="bg-gradient-to-br from-red-500 to-rose-600"
          />
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 auto-rows-fr">
          {/* Recent Transactions - Span 1 column */}
          <div className="md:col-span-1">
            <ModernTransactionList
              transactions={dashboardData?.recentTransactions}
              title="Recent Transactions"
              onSeeMore={() => navigate("/expense")}
              maxItems={5}
            />
          </div>

          {/* Spending Breakdown Donut Chart - Span 1 column */}
          <div className="card md:col-span-1">
            <h5 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-6">
              Spending Breakdown
            </h5>
            {spendingBreakdown.length > 0 ? (
              <DonutChart data={spendingBreakdown} />
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400 text-sm">
                No spending data available
              </div>
            )}
          </div>

          {/* Budget Alert - Span 1 column */}
          <div className="md:col-span-1">
            <BudgetAlert budgetData={budgetData} />
          </div>

          {/* Last 30 Days Expenses Chart - Span 2 columns on large screens */}
          <div className="md:col-span-2 lg:col-span-2">
            <Last30DaysExpenses
              data={dashboardData?.last30DaysExpenses?.transactions ?? []}
            />
          </div>

          {/* Recent Income - Span 1 column */}
          <div className="md:col-span-1">
            <ModernTransactionList
              transactions={dashboardData?.last30DaysIncome?.transactions}
              title="Recent Income"
              onSeeMore={() => navigate("/income")}
              maxItems={5}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Home;
