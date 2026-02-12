import React, { useState } from "react";
import { LuX } from "react-icons/lu";
import Input from "../Inputs/input";
import EmojiPickerPopup from "../EmojiPickerPopup";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apipath";
import { disableBudgetApi, isBudgetApiEnabled } from "../../utils/budgetApi";
import { LuTrendingUp } from "react-icons/lu";
import { FiAlertTriangle } from "react-icons/fi";

const QuickAddSheet = ({ isOpen, onClose, onAddExpense, onAddIncome, type = "expense" }) => {
  const [formData, setFormData] = useState({
    category: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    icon: "",
  });
  const [budgetCheck, setBudgetCheck] = useState(null);
  const [isCheckingBudget, setIsCheckingBudget] = useState(false);

  const handleChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
    if (key === "amount" || key === "category") {
      setBudgetCheck(null);
    }
  };

  const checkBudget = async () => {
    if (!formData.amount || !formData.category || type !== "expense") return;
    if (!isBudgetApiEnabled()) return;

    setIsCheckingBudget(true);
    try {
      const response = await axiosInstance.post(API_PATHS.BUDGET_LIMIT.CHECK_EXPENSE, {
        amount: parseFloat(formData.amount),
        category: formData.category,
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

  const handleSubmit = () => {
    if (type === "expense") {
      onAddExpense(formData);
    } else {
      // For income, map category to source
      onAddIncome({
        source: formData.category,
        amount: formData.amount,
        date: formData.date,
        icon: formData.icon,
      });
    }
    // Reset form
    setFormData({
      category: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      icon: "",
    });
    setBudgetCheck(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Slide-over Sheet */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white dark:bg-gray-900 shadow-xl transform transition-transform duration-300 ease-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-50">
              Quick Add {type === "expense" ? "Expense" : "Income"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
            >
              <LuX className="text-xl" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Emoji Picker */}
              <EmojiPickerPopup
                icon={formData.icon}
                onSelect={(selectedIcon) => handleChange("icon", selectedIcon)}
              />

              {/* Category/Source */}
              <Input
                value={formData.category}
                onChange={({ target }) => handleChange("category", target.value)}
                label={type === "expense" ? "Category" : "Source"}
                placeholder={type === "expense" ? "Rent, Groceries, etc" : "Salary, Freelance, etc"}
                type="text"
              />

              {/* Amount */}
              <Input
                value={formData.amount}
                onChange={({ target }) => handleChange("amount", target.value)}
                label="Amount"
                placeholder="0.00"
                type="number"
              />

              {/* Date */}
              <Input
                value={formData.date}
                onChange={({ target }) => handleChange("date", target.value)}
                label="Date"
                type="date"
              />

              {/* Budget Check Button (only for expenses) */}
              {type === "expense" && formData.amount && formData.category && (
                <div>
                  <button
                    type="button"
                    onClick={checkBudget}
                    disabled={isCheckingBudget}
                    className="w-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-4 py-2 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors disabled:opacity-50 text-sm font-medium"
                  >
                    {isCheckingBudget ? "Checking Budget..." : "Check Budget Impact"}
                  </button>
                </div>
              )}

              {/* Budget Check Results */}
              {budgetCheck && (
                <div className={`p-4 rounded-xl border ${
                  budgetCheck.canAdd
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {budgetCheck.canAdd ? (
                      <LuTrendingUp className="text-green-500 dark:text-green-400" />
                    ) : (
                      <FiAlertTriangle className="text-red-500 dark:text-red-400" />
                    )}
                    <span className={`font-medium text-sm ${
                      budgetCheck.canAdd
                        ? 'text-green-700 dark:text-green-300'
                        : 'text-red-700 dark:text-red-300'
                    }`}>
                      {budgetCheck.canAdd ? 'Budget Check Passed' : 'Budget Warning'}
                    </span>
                  </div>

                  {budgetCheck.warnings.length > 0 && (
                    <div className="space-y-1">
                      {budgetCheck.warnings.map((warning, index) => (
                        <p key={index} className="text-sm text-gray-700 dark:text-gray-300">
                          {warning}
                        </p>
                      ))}
                    </div>
                  )}

                  <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                    Overall Progress: {budgetCheck.overallProgress.toFixed(1)}%
                    {budgetCheck.categoryProgress > 0 && (
                      <span className="ml-2">
                        | Category Progress: {budgetCheck.categoryProgress.toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-800">
            <button
              onClick={handleSubmit}
              disabled={!formData.category || !formData.amount || !formData.date}
              className="w-full bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
            >
              Add {type === "expense" ? "Expense" : "Income"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default QuickAddSheet;

