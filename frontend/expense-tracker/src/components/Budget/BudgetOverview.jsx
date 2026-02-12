import React from "react";
import addThousandsSeprator from "../../utils/helper";
import { LuTarget, LuTrendingUp } from "react-icons/lu";
import { FiAlertTriangle } from "react-icons/fi";

const BudgetOverview = ({ budgetData }) => {
  const {
    overallLimit,
    currentSpending,
    overallProgress,
    month,
  } = budgetData;

  const remainingBudget = overallLimit - currentSpending;
  const isNearLimit = overallProgress >= 80 && overallProgress < 100;
  const isOverLimit = overallProgress >= 100;

  const getProgressColor = () => {
    if (isOverLimit) return "bg-red-500";
    if (isNearLimit) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStatusIcon = () => {
    if (isOverLimit) return <FiAlertTriangle className="text-red-500" />;
    if (isNearLimit) return <LuTrendingUp className="text-yellow-500" />;
    return <LuTarget className="text-green-500" />;
  };

  const getStatusText = () => {
    if (isOverLimit) return "Over Budget";
    if (isNearLimit) return "Near Limit";
    return "On Track";
  };

  const getStatusColor = () => {
    if (isOverLimit) return "text-red-600";
    if (isNearLimit) return "text-yellow-600";
    return "text-green-600";
  };

  const formatMonth = (monthStr) => {
    const [year, month] = monthStr.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long" });
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Budget Overview</h3>
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">{formatMonth(month)}</p>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Budget</span>
            <span className="font-semibold">₹{addThousandsSeprator(overallLimit)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Spent</span>
            <span className="font-semibold">₹{addThousandsSeprator(currentSpending)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Remaining</span>
            <span className={`font-semibold ${remainingBudget < 0 ? 'text-red-600' : 'text-green-600'}`}>
              ₹{addThousandsSeprator(Math.abs(remainingBudget))}
              {remainingBudget < 0 && " (Over)"}
            </span>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Progress</span>
          <span className="text-sm font-medium">{overallProgress.toFixed(1)}%</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${getProgressColor()}`}
            style={{ width: `${Math.min(overallProgress, 100)}%` }}
          ></div>
        </div>
      </div>

      {isOverLimit && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <FiAlertTriangle className="text-red-500" />
            <span className="text-sm text-red-700 font-medium">
              You've exceeded your monthly budget by ₹{addThousandsSeprator(Math.abs(remainingBudget))}
            </span>
          </div>
        </div>
      )}

      {isNearLimit && !isOverLimit && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <LuTrendingUp className="text-yellow-500" />
            <span className="text-sm text-yellow-700 font-medium">
              You're approaching your budget limit. Consider reducing spending.
            </span>
          </div>
        </div>
      )}

      {!isNearLimit && !isOverLimit && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <LuTarget className="text-green-500" />
            <span className="text-sm text-green-700 font-medium">
              Great! You're staying within your budget.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetOverview;
