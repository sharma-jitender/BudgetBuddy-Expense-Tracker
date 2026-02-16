import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { useUserAuth } from "../../hooks/useUserAuth";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apipath";
import toast from "react-hot-toast";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Analytics = () => {
  useUserAuth();

  const [transactionData, setTransactionData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [analytics, setAnalytics] = useState({
    totalExpense: 0,
    totalIncome: 0,
    balance: 0,
    categoryBreakdown: [],
    dailyTrend: [],
  });
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

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

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedMonth, selectedYear]);

  // Re-render charts when dark mode changes
  useEffect(() => {
    if (transactionData.length > 0) {
      filterAndAnalyze(transactionData);
    }
  }, [isDarkMode]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const [expenseRes, incomeRes] = await Promise.all([
        axiosInstance.get(API_PATHS.EXPENSE.GET_ALL_EXPENSE),
        axiosInstance.get(API_PATHS.INCOME.GET_ALL_INCOME),
      ]);

      const allTransactions = [
        ...(expenseRes.data || []).map(t => ({ ...t, type: 'expense' })),
        ...(incomeRes.data || []).map(t => ({ ...t, type: 'income' })),
      ];

      setTransactionData(allTransactions);
      filterAndAnalyze(allTransactions);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  const filterAndAnalyze = (transactions) => {
    const [year, month] = selectedMonth.split('-');
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);
    
    const filtered = transactions.filter(t => {
      const tDate = new Date(t.date);
      // Use UTC date components to avoid timezone shifts
      const utcYear = tDate.getUTCFullYear();
      const utcMonth = tDate.getUTCMonth() + 1;
      return utcMonth === monthNum && utcYear === yearNum;
    });

    setFilteredData(filtered);

    // Calculate analytics
    const expenses = filtered.filter(t => t.type === 'expense');
    const incomes = filtered.filter(t => t.type === 'income');

    const totalExpense = expenses.reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalIncome = incomes.reduce((sum, t) => sum + (t.amount || 0), 0);

    // Category breakdown for expenses
    const categoryMap = {};
    expenses.forEach(exp => {
      const cat = exp.category || 'Other';
      categoryMap[cat] = (categoryMap[cat] || 0) + exp.amount;
    });

    const categoryBreakdown = Object.entries(categoryMap).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2)),
    }));

    // Daily trend
    const dailyMap = {};
    filtered.forEach(t => {
      const tDate = new Date(t.date);
      // Use UTC date for consistency
      const day = new Date(tDate.getUTCFullYear(), tDate.getUTCMonth(), tDate.getUTCDate())
        .toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!dailyMap[day]) {
        dailyMap[day] = { date: day, expense: 0, income: 0 };
      }
      if (t.type === 'expense') {
        dailyMap[day].expense += t.amount;
      } else {
        dailyMap[day].income += t.amount;
      }
    });

    const dailyTrend = Object.values(dailyMap).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );

    setAnalytics({
      totalExpense: parseFloat(totalExpense.toFixed(2)),
      totalIncome: parseFloat(totalIncome.toFixed(2)),
      balance: parseFloat((totalIncome - totalExpense).toFixed(2)),
      categoryBreakdown,
      dailyTrend,
    });
  };

  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(Date.UTC(2026, i, 1));
    return {
      value: date.toISOString().slice(0, 7),
      label: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    };
  });

  return (
    <DashboardLayout activeMenu="Analytics">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Financial Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Track your spending and income patterns by month and year
            </p>
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {months.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-lg p-6 border border-blue-200 dark:border-blue-700">
            <p className="text-sm font-medium text-blue-600 dark:text-blue-300">Total Income</p>
            <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-2">
              ₹{analytics.totalIncome.toFixed(2)}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-300 mt-2">This month</p>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-red-800 rounded-lg p-6 border border-red-200 dark:border-red-700">
            <p className="text-sm font-medium text-red-600 dark:text-red-300">Total Expense</p>
            <p className="text-3xl font-bold text-red-900 dark:text-red-100 mt-2">
              ₹{analytics.totalExpense.toFixed(2)}
            </p>
            <p className="text-xs text-red-600 dark:text-red-300 mt-2">This month</p>
          </div>

          <div className={`bg-gradient-to-br ${analytics.balance >= 0 ? 'from-green-50 to-green-100 dark:from-green-900 dark:to-green-800' : 'from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800'} rounded-lg p-6 border ${analytics.balance >= 0 ? 'border-green-200 dark:border-green-700' : 'border-orange-200 dark:border-orange-700'}`}>
            <p className={`text-sm font-medium ${analytics.balance >= 0 ? 'text-green-600 dark:text-green-300' : 'text-orange-600 dark:text-orange-300'}`}>
              Balance
            </p>
            <p className={`text-3xl font-bold ${analytics.balance >= 0 ? 'text-green-900 dark:text-green-100' : 'text-orange-900 dark:text-orange-100'} mt-2`}>
              ₹{Math.abs(analytics.balance).toFixed(2)}
            </p>
            <p className={`text-xs ${analytics.balance >= 0 ? 'text-green-600 dark:text-green-300' : 'text-orange-600 dark:text-orange-300'} mt-2`}>
              {analytics.balance >= 0 ? 'Surplus' : 'Deficit'}
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Trend Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Daily Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.dailyTrend}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={isDarkMode ? '#4b5563' : '#e5e7eb'}
                />
                <XAxis 
                  dataKey="date" 
                  stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                  tick={{ fill: isDarkMode ? '#d1d5db' : '#6b7280' }}
                />
                <YAxis 
                  stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                  tick={{ fill: isDarkMode ? '#d1d5db' : '#6b7280' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                    border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    color: isDarkMode ? '#e5e7eb' : '#1f2937'
                  }}
                />
                <Legend 
                  wrapperStyle={{
                    color: isDarkMode ? '#d1d5db' : '#6b7280'
                  }}
                />
                <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="expense" stroke="#EF4444" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Expense Breakdown</h3>
            {analytics.categoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                    data={analytics.categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                      label={({ name, value }) => `${name}: ₹${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics.categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                      border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      color: isDarkMode ? '#e5e7eb' : '#1f2937'
                    }}
                    formatter={(value) => `₹${value.toFixed(2)}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-12">No expense data for this period</p>
            )}
          </div>
        </div>

        {/* Category Details */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Category Details</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Category</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">Amount</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {analytics.categoryBreakdown.map((category, idx) => (
                  <tr key={idx} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{category.name}</td>
                    <td className="px-4 py-3 text-right text-gray-900 dark:text-white">₹{category.value.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">
                      {((category.value / analytics.totalExpense) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
