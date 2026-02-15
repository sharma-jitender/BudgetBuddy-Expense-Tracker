import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { useUserAuth } from "../../hooks/useUserAuth";
import axiosInstance from "../../utils/axiosInstance";
import toast from "react-hot-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const SpendingGoals = () => {
  useUserAuth();

  const [goals, setGoals] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    limit: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  const categories = [
    'Food & Dining',
    'Transportation',
    'Entertainment',
    'Shopping',
    'Utilities',
    'Health & Fitness',
    'Education',
    'Travel',
    'Other'
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const expRes = await axiosInstance.get('/api/v1/expense/get');
      setExpenses(expRes.data || []);
      
      const stored = localStorage.getItem('spendingGoals');
      if (stored) {
        setGoals(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load goals");
    } finally {
      setLoading(false);
    }
  };

  const calculateSpent = (category) => {
    return expenses
      .filter(e => e.category === category)
      .reduce((sum, e) => sum + (e.amount || 0), 0);
  };

  const handleAddGoal = () => {
    if (!formData.category || !formData.limit) {
      toast.error("Please fill in all fields");
      return;
    }

    const newGoal = {
      id: Date.now(),
      category: formData.category,
      limit: parseFloat(formData.limit),
      description: formData.description,
      createdAt: new Date().toISOString(),
    };

    const updated = [...goals, newGoal];
    setGoals(updated);
    localStorage.setItem('spendingGoals', JSON.stringify(updated));
    setFormData({ category: '', limit: '', description: '' });
    setShowForm(false);
    toast.success("Goal added successfully");
  };

  const handleDeleteGoal = (id) => {
    const updated = goals.filter(g => g.id !== id);
    setGoals(updated);
    localStorage.setItem('spendingGoals', JSON.stringify(updated));
    toast.success("Goal deleted");
  };

  const chartData = goals.map(goal => ({
    category: goal.category,
    limit: goal.limit,
    spent: calculateSpent(goal.category),
  }));

  const totalLimit = goals.reduce((sum, g) => sum + g.limit, 0);
  const totalSpent = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  return (
    <DashboardLayout activeMenu="Goals">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Spending Goals
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Set and monitor your spending targets
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
          >
            {showForm ? 'Cancel' : 'New Goal'}
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 rounded-lg p-6 border border-purple-200 dark:border-purple-700">
            <p className="text-sm font-medium text-purple-600 dark:text-purple-300">Total Budget</p>
            <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 mt-2">${totalLimit.toFixed(2)}</p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 rounded-lg p-6 border border-orange-200 dark:border-orange-700">
            <p className="text-sm font-medium text-orange-600 dark:text-orange-300">Total Spent</p>
            <p className="text-3xl font-bold text-orange-900 dark:text-orange-100 mt-2">${totalSpent.toFixed(2)}</p>
          </div>

          <div className={`bg-gradient-to-br ${totalSpent > totalLimit ? 'from-red-50 to-red-100 dark:from-red-900 dark:to-red-800' : 'from-green-50 to-green-100 dark:from-green-900 dark:to-green-800'} rounded-lg p-6 border ${totalSpent > totalLimit ? 'border-red-200 dark:border-red-700' : 'border-green-200 dark:border-green-700'}`}>
            <p className={`text-sm font-medium ${totalSpent > totalLimit ? 'text-red-600 dark:text-red-300' : 'text-green-600 dark:text-green-300'}`}>
              Remaining
            </p>
            <p className={`text-3xl font-bold ${totalSpent > totalLimit ? 'text-red-900 dark:text-red-100' : 'text-green-900 dark:text-green-100'} mt-2`}>
              ${Math.abs(totalLimit - totalSpent).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add New Goal</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Spending Limit ($)</label>
                <input
                  type="number"
                  placeholder="100"
                  value={formData.limit}
                  onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description (Optional)</label>
                <input
                  type="text"
                  placeholder="Monthly budget for groceries"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>

              <button
                onClick={handleAddGoal}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
              >
                Create Goal
              </button>
            </div>
          </div>
        )}

        {/* Chart */}
        {chartData.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Budget vs Spent</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="category" stroke="#6b7280" angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#e5e7eb'
                  }}
                  formatter={(value) => `$${value.toFixed(2)}`}
                />
                <Legend />
                <Bar dataKey="limit" fill="#3B82F6" name="Budget" />
                <Bar dataKey="spent" fill="#EF4444" name="Spent" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Goals List */}
        <div className="space-y-4">
          {goals.length === 0 ? (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-12 text-center border border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-400 text-lg">No spending goals yet. Create one to get started!</p>
            </div>
          ) : (
            goals.map(goal => {
              const spent = calculateSpent(goal.category);
              const percentage = (spent / goal.limit) * 100;
              const isOverBudget = spent > goal.limit;

              return (
                <div key={goal.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{goal.category}</h3>
                      {goal.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{goal.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="px-3 py-1 text-sm bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-200 hover:bg-red-100 dark:hover:bg-red-800 rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        ${spent.toFixed(2)} / ${goal.limit.toFixed(2)}
                      </span>
                      <span className={`text-sm font-semibold ${isOverBudget ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${isOverBudget ? 'bg-red-500' : 'bg-green-500'}`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {isOverBudget && (
                    <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                      Over budget by ${(spent - goal.limit).toFixed(2)}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SpendingGoals;
