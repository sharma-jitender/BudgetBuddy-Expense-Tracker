import React from "react";
import addThousandsSeprator from "../../utils/helper";
import { LuTrendingUp, LuTarget } from "react-icons/lu";
import { FiAlertTriangle } from "react-icons/fi";

const BudgetProgress = ({ budgetData }) => {
  const { categoryLimits, categorySpending } = budgetData;

  if (!categoryLimits || categoryLimits.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Category Progress</h3>
        <div className="text-center py-8">
          <p className="text-gray-500 mb-2">No category budgets set</p>
          <p className="text-sm text-gray-400">
            Set category-specific budgets to track spending in detail
          </p>
        </div>
      </div>
    );
  }

  const getCategoryProgress = (category, limit) => {
    const spent = categorySpending[category] || 0;
    return (spent / limit) * 100;
  };

  const getProgressColor = (progress) => {
    if (progress >= 100) return "bg-red-500";
    if (progress >= 80) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStatusIcon = (progress) => {
    if (progress >= 100) return <FiAlertTriangle className="text-red-500" />;
    if (progress >= 80) return <LuTrendingUp className="text-yellow-500" />;
    return <LuTarget className="text-green-500" />;
  };

  const getStatusText = (progress) => {
    if (progress >= 100) return "Over Limit";
    if (progress >= 80) return "Near Limit";
    return "On Track";
  };

  const getStatusColor = (progress) => {
    if (progress >= 100) return "text-red-600";
    if (progress >= 80) return "text-yellow-600";
    return "text-green-600";
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Category Progress</h3>
      
      <div className="space-y-4">
        {categoryLimits.map((catLimit, index) => {
          const progress = getCategoryProgress(catLimit.category, catLimit.limit);
          const spent = categorySpending[catLimit.category] || 0;
          const remaining = catLimit.limit - spent;

          return (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getStatusIcon(progress)}
                  <span className="font-medium">{catLimit.category}</span>
                </div>
                <span className={`text-sm font-medium ${getStatusColor(progress)}`}>
                  {getStatusText(progress)}
                </span>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Budget</span>
                  <span className="font-medium">₹{addThousandsSeprator(catLimit.limit)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Spent</span>
                  <span className="font-medium">₹{addThousandsSeprator(spent)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Remaining</span>
                  <span className={`font-medium ${remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ₹{addThousandsSeprator(Math.abs(remaining))}
                    {remaining < 0 && " (Over)"}
                  </span>
                </div>
              </div>

              <div className="mb-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-500">Progress</span>
                  <span className="text-xs font-medium">{progress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(progress)}`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  ></div>
                </div>
              </div>

              {progress >= 100 && (
                <div className="bg-red-50 border border-red-200 rounded p-2">
                  <div className="flex items-center gap-2">
                    <FiAlertTriangle className="text-red-500 text-sm" />
                    <span className="text-xs text-red-700">
                      Exceeded by ₹{addThousandsSeprator(Math.abs(remaining))}
                    </span>
                  </div>
                </div>
              )}

              {progress >= 80 && progress < 100 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                  <div className="flex items-center gap-2">
                    <LuTrendingUp className="text-yellow-500 text-sm" />
                    <span className="text-xs text-yellow-700">
                      Approaching limit - ₹{addThousandsSeprator(remaining)} remaining
                    </span>
                  </div>
                </div>
              )}

              {progress < 80 && (
                <div className="bg-green-50 border border-green-200 rounded p-2">
                  <div className="flex items-center gap-2">
                    <LuTarget className="text-green-500 text-sm" />
                    <span className="text-xs text-green-700">
                      ₹{addThousandsSeprator(remaining)} remaining
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {Object.keys(categorySpending).length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Other Categories</h4>
          <div className="space-y-1">
            {Object.entries(categorySpending)
              .filter(([category]) => !categoryLimits.some(cat => cat.category === category))
              .map(([category, spent]) => (
                <div key={category} className="flex justify-between text-sm">
                  <span className="text-gray-600">{category}</span>
                  <span className="font-medium">₹{addThousandsSeprator(spent)}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetProgress;
