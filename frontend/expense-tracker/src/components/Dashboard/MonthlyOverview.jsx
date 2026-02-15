import React, { useState, useEffect } from "react";
import CustomBarChart from "../Charts/CustomBarChart";
import addThousandsSeprator from "../../utils/helper";
import { LuTrendingUp, LuTrendingDown } from "react-icons/lu";

const MonthlyOverview = ({ monthlyData, year, onYearChange }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  // Calculate yearly totals
  const yearlyTotals = monthlyData.reduce(
    (acc, month) => ({
      totalIncome: acc.totalIncome + month.income,
      totalExpense: acc.totalExpense + month.expense,
    }),
    { totalIncome: 0, totalExpense: 0 }
  );

  const yearlyBalance = yearlyTotals.totalIncome - yearlyTotals.totalExpense;

  // Get selected month data
  const currentMonthData = monthlyData.find((m) => m.month === selectedMonth);

  // Prepare chart data
  const chartData = monthlyData.map((month) => ({
    name: month.monthName,
    income: Math.round(month.income),
    expense: Math.round(month.expense),
  }));

  const handleYearChange = (direction) => {
    const newYear = direction === "prev" ? year - 1 : year + 1;
    onYearChange(newYear);
  };

  return (
    <div className="space-y-6">
      {/* Year Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex items-center justify-between border border-gray-200 dark:border-gray-700">
        <button
          onClick={() => handleYearChange("prev")}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg hover:bg-gray-300 transition-colors text-gray-800 dark:text-gray-200"
        >
          ← Previous Year
        </button>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{year}</h2>
        <button
          onClick={() => handleYearChange("next")}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg hover:bg-gray-300 transition-colors text-gray-800 dark:text-gray-200"
        >
          Next Year →
        </button>
      </div>

      {/* Yearly Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Yearly Income</p>
              <p className="text-2xl font-bold text-green-600">
                ₹{addThousandsSeprator(yearlyTotals.totalIncome)}
              </p>
            </div>
            <LuTrendingUp className="text-green-500 text-3xl" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Yearly Expense</p>
              <p className="text-2xl font-bold text-red-600">
                ₹{addThousandsSeprator(yearlyTotals.totalExpense)}
              </p>
            </div>
            <LuTrendingDown className="text-red-500 text-3xl" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Yearly Balance</p>
              <p className={`text-2xl font-bold ${yearlyBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
                ₹{addThousandsSeprator(yearlyBalance)}
              </p>
            </div>
            <div className={`text-3xl ${yearlyBalance >= 0 ? "text-green-500" : "text-red-500"}`}>
              {yearlyBalance >= 0 ? "↑" : "↓"}
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Bar Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Monthly Income vs Expenses
        </h3>
        <CustomBarChart data={chartData} isDarkMode={isDarkMode} />
      </div>

      {/* Monthly Breakdown List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Monthly Breakdown
        </h3>
        
        {/* Month Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Month
          </label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {monthlyData.map((month) => (
              <option key={month.month} value={month.month}>
                {month.monthName} - Income: ₹{addThousandsSeprator(month.income)}, 
                Expense: ₹{addThousandsSeprator(month.expense)}
              </option>
            ))}
          </select>
        </div>

        {/* Selected Month Details */}
        {currentMonthData && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <p className="text-sm text-gray-600 mb-1">Income</p>
                <p className="text-xl font-bold text-green-600">
                  ₹{addThousandsSeprator(currentMonthData.income)}
                </p>
              </div>
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <p className="text-sm text-gray-600 mb-1">Expense</p>
                <p className="text-xl font-bold text-red-600">
                  ₹{addThousandsSeprator(currentMonthData.expense)}
                </p>
              </div>
              <div className={`${currentMonthData.balance >= 0 ? "bg-blue-50 border-blue-200" : "bg-yellow-50 border-yellow-200"} rounded-lg p-4 border`}>
                <p className="text-sm text-gray-600 mb-1">Balance</p>
                <p className={`text-xl font-bold ${currentMonthData.balance >= 0 ? "text-blue-600" : "text-yellow-600"}`}>
                  ₹{addThousandsSeprator(currentMonthData.balance)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Full Year Table */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 dark:border-gray-600">
                <th className="text-left py-3 px-2 font-semibold text-gray-700 dark:text-gray-300">Month</th>
                <th className="text-right py-3 px-2 font-semibold text-gray-700 dark:text-gray-300">Income</th>
                <th className="text-right py-3 px-2 font-semibold text-gray-700 dark:text-gray-300">Expense</th>
                <th className="text-right py-3 px-2 font-semibold text-gray-700 dark:text-gray-300">Balance</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((month) => (
                <tr
                  key={month.month}
                  className={`border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    month.month === selectedMonth ? "bg-blue-50 dark:bg-blue-900" : ""
                  }`}
                  onClick={() => setSelectedMonth(month.month)}
                  style={{ cursor: "pointer" }}
                >
                  <td className="py-3 px-2 font-medium text-gray-800 dark:text-gray-200">
                    {month.monthName}
                  </td>
                  <td className="text-right py-3 px-2 text-green-600 dark:text-green-400 font-medium">
                    ₹{addThousandsSeprator(month.income)}
                  </td>
                  <td className="text-right py-3 px-2 text-red-600 dark:text-red-400 font-medium">
                    ₹{addThousandsSeprator(month.expense)}
                  </td>
                  <td className={`text-right py-3 px-2 font-medium ${
                    month.balance >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                  }`}>
                    ₹{addThousandsSeprator(month.balance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MonthlyOverview;
