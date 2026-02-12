import React from "react";
import { LuTrendingUp, LuTarget } from "react-icons/lu";
import { FiAlertTriangle } from "react-icons/fi";
import addThousandsSeprator from "../../utils/helper";

const BudgetAlert = ({ budgetData }) => {
  if (!budgetData || !budgetData.overallLimit) {
    return null;
  }

  const { overallLimit, currentSpending, overallProgress, categoryLimits, categorySpending } = budgetData;

  const remainingBudget = overallLimit - currentSpending;
  const isNearLimit = overallProgress >= 80 && overallProgress < 100;
  const isOverLimit = overallProgress >= 100;

  const categoryAlerts = categoryLimits
    .map(catLimit => {
      const spent = categorySpending[catLimit.category] || 0;
      const progress = (spent / catLimit.limit) * 100;
      const remaining = catLimit.limit - spent;
      
      return {
        category: catLimit.category,
        progress,
        spent,
        limit: catLimit.limit,
        remaining,
        isOver: progress >= 100,
        isNear: progress >= 80 && progress < 100,
      };
    })
    .filter(alert => alert.isOver || alert.isNear);

  const getOverallStatusColor = () => {
    if (isOverLimit) return "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20";
    if (isNearLimit) return "border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20";
    return "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20";
  };

  const getOverallStatusIcon = () => {
    if (isOverLimit) return <FiAlertTriangle className="text-red-500" />;
    if (isNearLimit) return <LuTrendingUp className="text-yellow-500" />;
    return <LuTarget className="text-green-500" />;
  };

  const getOverallStatusText = () => {
    if (isOverLimit) return "Over Budget";
    if (isNearLimit) return "Near Budget Limit";
    return "On Track";
  };

  const getOverallStatusTextColor = () => {
    if (isOverLimit) return "text-red-700 dark:text-red-400";
    if (isNearLimit) return "text-yellow-700 dark:text-yellow-400";
    return "text-green-700 dark:text-green-400";
  };

  return (
    <div className="space-y-4">
      <div className={`border rounded-[24px] p-6 ${getOverallStatusColor()}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {getOverallStatusIcon()}
            <span className={`font-semibold text-sm ${getOverallStatusTextColor()}`}>
              {getOverallStatusText()}
            </span>
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            {overallProgress.toFixed(1)}% used
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Monthly Budget</span>
            <span className="font-semibold text-gray-900 dark:text-gray-50">₹{addThousandsSeprator(overallLimit)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Spent</span>
            <span className="font-semibold text-gray-900 dark:text-gray-50">₹{addThousandsSeprator(currentSpending)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Remaining</span>
            <span className={`font-semibold ${remainingBudget < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
              ₹{addThousandsSeprator(Math.abs(remainingBudget))}
              {remainingBudget < 0 && " (Over)"}
            </span>
          </div>
        </div>

        <div className="mt-4">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all duration-300 ${
                isOverLimit ? 'bg-red-500' : isNearLimit ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(overallProgress, 100)}%` }}
            ></div>
          </div>
        </div>

        {isOverLimit && (
          <p className="text-sm text-red-700 dark:text-red-400 mt-3 font-medium">
            You've exceeded your monthly budget by ₹{addThousandsSeprator(Math.abs(remainingBudget))}
          </p>
        )}

        {isNearLimit && !isOverLimit && (
          <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-3 font-medium">
            You're approaching your budget limit. Consider reducing spending.
          </p>
        )}

        {!isNearLimit && !isOverLimit && (
          <p className="text-sm text-green-700 dark:text-green-400 mt-3 font-medium">
            Great! You're staying within your budget.
          </p>
        )}
      </div>

      {categoryAlerts.length > 0 && (
        <div className="border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20 rounded-[24px] p-4">
          <h4 className="font-semibold text-orange-800 dark:text-orange-400 mb-4">Category Alerts</h4>
          <div className="space-y-3">
            {categoryAlerts.map((alert, index) => (
              <div key={index} className="border border-orange-200 dark:border-orange-800 bg-white dark:bg-gray-900 rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {alert.isOver ? (
                      <FiAlertTriangle className="text-red-500 dark:text-red-400 text-sm" />
                    ) : (
                      <LuTrendingUp className="text-yellow-500 dark:text-yellow-400 text-sm" />
                    )}
                    <span className="font-medium text-sm text-gray-900 dark:text-gray-50">{alert.category}</span>
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                    {alert.progress.toFixed(1)}% used
                  </span>
                </div>
                
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Budget: ₹{addThousandsSeprator(alert.limit)}</span>
                  <span className="text-gray-600 dark:text-gray-400">Spent: ₹{addThousandsSeprator(alert.spent)}</span>
                </div>

                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${
                      alert.isOver ? 'bg-red-500' : 'bg-yellow-500'
                    }`}
                    style={{ width: `${Math.min(alert.progress, 100)}%` }}
                  ></div>
                </div>

                <p className="text-xs mt-2 text-orange-700 dark:text-orange-400 font-medium">
                  {alert.isOver 
                    ? `Exceeded by ₹${addThousandsSeprator(Math.abs(alert.remaining))}`
                    : `₹${addThousandsSeprator(alert.remaining)} remaining`
                  }
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetAlert;
