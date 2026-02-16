import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../utils/apipath';
import DashboardLayout from '../components/layouts/DashboardLayout';

const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [totalMonthly, setTotalMonthly] = useState(0);
  const [loading, setLoading] = useState(true);
  const [detecting, setDetecting] = useState(false);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const token = localStorage.getItem('token'); 
      const response = await fetch(`${BASE_URL}/api/subscriptions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setSubscriptions(data.subscriptions || []);
      setTotalMonthly(data.totalMonthly || 0);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDetect = async () => {
    setDetecting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/api/subscriptions/detect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      alert(`Detected ${data.detected} subscriptions`);
      fetchSubscriptions();
    } catch (error) {
      console.error('Error detecting subscriptions:', error);
      alert('Failed to detect subscriptions');
    } finally {
      setDetecting(false);
    }
  };

  const getDaysUntil = (date) => {
    const days = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getFrequencyLabel = (frequency) => {
    const labels = {
      'daily': 'Daily',
      'weekly': 'Weekly',
      'monthly': 'Monthly',
      'yearly': 'Yearly',
    };
    return labels[frequency] || frequency;
  };

  if (loading) {
    return (
      <DashboardLayout activeMenu="Subscriptions">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeMenu="Subscriptions">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Subscriptions & Bills
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Track your recurring payments
            </p>
          </div>
          <button
            onClick={handleDetect}
            disabled={detecting}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
          >
            {detecting ? 'Detecting...' : 'Auto-Detect'}
          </button>
        </div>

        {/* Summary Card */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 rounded-xl shadow-sm border border-indigo-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Monthly Cost
              </p>
              <p className="mt-2 text-4xl font-bold text-gray-900 dark:text-white">
                ₹{totalMonthly.toFixed(2)}
              </p>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {subscriptions.length} active {subscriptions.length !== 1 ? 'subscriptions' : 'subscription'}
              </p>
            </div>
          </div>
        </div>

        {/* Subscriptions List */}
        {subscriptions.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Subscriptions Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Click "Auto-Detect" to find recurring payments
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {subscriptions.map((sub) => {
              const daysUntil = getDaysUntil(sub.nextBillingDate);
              const isUpcoming = daysUntil <= 7;
              
              return (
                <div
                  key={sub._id}
                  className={`bg-white dark:bg-gray-900 rounded-xl shadow-sm border ${
                    isUpcoming 
                      ? 'border-yellow-300 dark:border-yellow-700' 
                      : 'border-gray-200 dark:border-gray-800'
                  } p-6 hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-2xl">
                      {sub.icon}
                    </div>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                          {sub.name}
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {getFrequencyLabel(sub.frequency)}
                          </span>
                          <span className="text-sm text-gray-400">•</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {sub.category}
                          </span>
                        </div>
                        {sub.occurrenceCount > 0 && (
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {sub.occurrenceCount} payments • Total: ₹{sub.totalSpent.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        ₹{sub.amount.toFixed(2)}
                      </p>
                      <p className={`text-sm mt-1 ${
                        isUpcoming 
                          ? 'text-yellow-600 dark:text-yellow-400 font-medium' 
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {daysUntil === 0 
                          ? 'Due today' 
                          : daysUntil === 1 
                          ? 'Due tomorrow' 
                          : daysUntil < 0 
                          ? `Overdue ${Math.abs(daysUntil)} days`
                          : `Due in ${daysUntil} days`
                        }
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {new Date(sub.nextBillingDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Subscriptions;