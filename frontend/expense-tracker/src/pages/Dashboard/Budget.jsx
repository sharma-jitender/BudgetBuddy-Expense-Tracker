import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { useUserAuth } from "../../hooks/useUserAuth";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apipath";
import toast from "react-hot-toast";
import BudgetLimitForm from "../../components/Budget/BudgetLimitForm";
import BudgetOverview from "../../components/Budget/BudgetOverview";
import BudgetProgress from "../../components/Budget/BudgetProgress";
import { disableBudgetApi, isBudgetApiEnabled } from "../../utils/budgetApi";

const Budget = () => {
  useUserAuth();

  const [budgetData, setBudgetData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const fetchBudgetData = async (month = null) => {
    if (loading) return;
    setLoading(true);

    try {
      if (!isBudgetApiEnabled()) {
        setBudgetData(null);
        return;
      }
      
      const monthToFetch = month || selectedMonth;
      let response;
      
      if (monthToFetch === new Date().toISOString().slice(0, 7)) {
        // Fetch current month budget
        response = await axiosInstance.get(
          API_PATHS.BUDGET_LIMIT.GET_CURRENT
        );
      } else {
        // Fetch budget for specific month
        response = await axiosInstance.get(
          API_PATHS.BUDGET_LIMIT.GET_BY_MONTH(monthToFetch)
        );
      }
      
      if (response.data) {
        setBudgetData(response.data);
      }
    } catch (error) {
      if (error?.response?.status === 404) {
        disableBudgetApi();
        setBudgetData(null);
        return;
      }
      console.log("Error fetching budget data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetBudgetLimit = async (budgetData) => {
    try {
      if (!isBudgetApiEnabled()) {
        toast.error("Budget feature is not available on the current backend.");
        return;
      }
      await axiosInstance.post(API_PATHS.BUDGET_LIMIT.SET_LIMIT, budgetData);
      setShowForm(false);
      toast.success("Budget limit set successfully!");
      fetchBudgetData(budgetData.month);
    } catch (error) {
      console.error("Error setting budget limit:", error);
      if (error?.response?.status === 404) {
        disableBudgetApi();
        toast.error("Budget feature is not available on the current backend.");
        return;
      }
      toast.error(
        error.response?.data?.message || "Failed to set budget limit"
      );
    }
  };

  const handleMonthChange = (direction) => {
    const [year, month] = selectedMonth.split("-");
    let newDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    
    const newMonth = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, "0")}`;
    setSelectedMonth(newMonth);
    fetchBudgetData(newMonth);
  };

  const formatMonth = (monthStr) => {
    const [year, month] = monthStr.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long" });
  };

  useEffect(() => {
    fetchBudgetData();
  }, []);

  return (
    <DashboardLayout activeMenu="Budget">
      <div className="my-5 mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Budget Management
          </h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            {budgetData?.overallLimit ? "Update Budget" : "Set Budget"}
          </button>
        </div>

        {showForm && (
          <div className="mb-6">
            <BudgetLimitForm
              currentBudget={budgetData}
              onSubmit={handleSetBudgetLimit}
              onCancel={() => setShowForm(false)}
              selectedMonth={selectedMonth}
            />
          </div>
        )}

        {!showForm && (
          <div className="mb-6 bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => handleMonthChange("prev")}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                ← Previous
              </button>
              <h2 className="text-lg font-semibold text-gray-800">
                {formatMonth(selectedMonth)}
              </h2>
              <button
                onClick={() => handleMonthChange("next")}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {budgetData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BudgetOverview budgetData={budgetData} />
            <BudgetProgress budgetData={budgetData} />
          </div>
        )}

        {!budgetData?.overallLimit && !showForm && (
          <div className="text-center py-12">
            <div className="bg-gray-50 rounded-lg p-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No Budget Set
              </h3>
              <p className="text-gray-500 mb-4">
                Set a monthly budget to track your spending and stay on top of
                your finances.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Set Your First Budget
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Budget;
