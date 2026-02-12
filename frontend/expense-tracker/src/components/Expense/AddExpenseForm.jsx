import React, { useState } from "react";
import Input from "../Inputs/input";
import EmojiPickerPopup from "../EmojiPickerPopup";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apipath";
import { disableBudgetApi, isBudgetApiEnabled } from "../../utils/budgetApi";

import { LuTrendingUp } from "react-icons/lu";
import { FiAlertTriangle } from "react-icons/fi";

const AddExpenseForm = ({ onAddExpense }) => {
  const [expense, setExpense] = useState({
    category: "",
    amount: "",
    date: "",
    icon: "",
  });
  const [budgetCheck, setBudgetCheck] = useState(null);
  const [isCheckingBudget, setIsCheckingBudget] = useState(false);

  const handleChange = (key, value) => {
    setExpense({ ...expense, [key]: value });
    // Clear budget check when user changes amount or category
    if (key === "amount" || key === "category") {
      setBudgetCheck(null);
    }
  };

  const checkBudget = async () => {
    if (!expense.amount || !expense.category) return;
    if (!isBudgetApiEnabled()) return;

    setIsCheckingBudget(true);
    try {
      const response = await axiosInstance.post(API_PATHS.BUDGET_LIMIT.CHECK_EXPENSE, {
        amount: parseFloat(expense.amount),
        category: expense.category,
      });
      setBudgetCheck(response.data);
    } catch (error) {
      if (error?.response?.status === 404) {
        disableBudgetApi();
        setBudgetCheck(null);
        return;
      }
      console.error("Error checking budget:", error);
    } finally {
      setIsCheckingBudget(false);
    }
  };
  return (
    <div>
      <EmojiPickerPopup
        icon={expense.icon}
        onSelect={(selectedIcon) => handleChange("icon", selectedIcon)}
      />
      <Input
        value={expense.category}
        onChange={({ target }) => handleChange("category", target.value)}
        label="expense source"
        placeholder="Rent, Groceries, etc"
        type="text"
      />

      <Input
        value={expense.amount}
        onChange={({ target }) => handleChange("amount", target.value)}
        label="Amount "
        placeholder=""
        type="number"
      />

      <Input
        value={expense.date}
        onChange={({ target }) => handleChange("date", target.value)}
        label="Date "
        placeholder=""
        type="date"
      />

      {/* Budget Check Button */}
      {expense.amount && expense.category && (
        <div className="mt-4">
          <button
            type="button"
            onClick={checkBudget}
            disabled={isCheckingBudget}
            className="w-full bg-blue-50 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
          >
            {isCheckingBudget ? "Checking Budget..." : "Check Budget Impact"}
          </button>
        </div>
      )}

      {/* Budget Check Results */}
      {budgetCheck && (
        <div className={`mt-4 p-3 rounded-lg border ${
          budgetCheck.canAdd ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {budgetCheck.canAdd ? (
              <LuTrendingUp className="text-green-500" />
            ) : (
              <FiAlertTriangle className="text-red-500" />
            )}
            <span className={`font-medium ${
              budgetCheck.canAdd ? 'text-green-700' : 'text-red-700'
            }`}>
              {budgetCheck.canAdd ? 'Budget Check Passed' : 'Budget Warning'}
            </span>
          </div>
          
          {budgetCheck.warnings.length > 0 && (
            <div className="space-y-1">
              {budgetCheck.warnings.map((warning, index) => (
                <p key={index} className="text-sm text-gray-700">{warning}</p>
              ))}
            </div>
          )}
          
          <div className="mt-2 text-xs text-gray-600">
            Overall Progress: {budgetCheck.overallProgress.toFixed(1)}%
            {budgetCheck.categoryProgress > 0 && (
              <span className="ml-2">
                | Category Progress: {budgetCheck.categoryProgress.toFixed(1)}%
              </span>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-end mt-6">
        <button
          type="button"
          className="add-btn add-btn-fill"
          onClick={() => onAddExpense(expense)}
        >
          Add Expense
        </button>
      </div>
    </div>
  );
};

export default AddExpenseForm;
