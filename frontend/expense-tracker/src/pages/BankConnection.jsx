import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layouts/DashboardLayout';
import PlaidLinkButton from '../components/PlaidLinkButton';
import { BASE_URL } from '../utils/apipath';

const BankConnection = () => {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch Plaid status
  const fetchStatus = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/plaid/status`);
      const data = await response.json();
      setStatus(data);
      console.log(' Plaid Status:', data);
    } catch (error) {
      console.error(' Error fetching status:', error);
    }
  };

  // Fetch accounts
  const fetchAccounts = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/plaid/accounts`);
      const data = await response.json();
      setAccounts(data.accounts || []);
      console.log('Accounts fetched:', data.accounts?.length || 0);
    } catch (error) {
      console.error(' Error fetching accounts:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/plaid/transactions/sync`, {
        method: 'POST',
      });
      const data = await response.json();
      setTransactions(data.transactions || []);
      console.log('Transactions fetched successfully');
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchStatus();
      await fetchAccounts();
      setLoading(false);
    };
    loadData();
  }, []);

  const handleSuccess = async () => {
    console.log('Bank connection established');
    setLoading(true);
    await fetchStatus();
    await fetchAccounts();
    await fetchTransactions();
    setLoading(false);
  };

  return (
    <DashboardLayout activeMenu="bank">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            🏦 Bank Connection
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Test Plaid Integration - Sandbox Mode
          </p>
        </div>

        {/* Status Card */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
             Connection Status
          </h2>
          {status ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Environment:</span>
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
                  {status.environment}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Connected Banks:</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {status.connected_items}
                </span>
              </div>
              {status.items && status.items.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Connected Institutions:
                  </p>
                  <ul className="space-y-1">
                    {status.items.map((item, idx) => (
                      <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        {item.institution}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">Loading status...</p>
          )}
        </div>

        {/* Connect Bank Card */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 rounded-xl shadow-sm border border-blue-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            🔗 Connect Your Bank
          </h2>
          <div className="bg-white dark:bg-gray-900 rounded-lg p-4 mb-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              🧪 Test Credentials (Sandbox Mode):
            </p>
            <div className="space-y-1 font-mono text-sm">
              <p className="text-gray-600 dark:text-gray-400">
                Username: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">user_good</code>
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Password: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">pass_good</code>
              </p>
            </div>
          </div>
          <PlaidLinkButton onSuccess={handleSuccess} />
        </div>

        {/* Accounts Section */}
        {accounts.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              💳 Connected Accounts ({accounts.length})
            </h2>
            <div className="space-y-4">
              {accounts.map((account) => (
                <div
                  key={account.account_id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {account.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {account.institution_name} • {account.type}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Account: ••••{account.mask || account.account_id.slice(-4)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      ₹{account.balances.current?.toFixed(2) || '0.00'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Available: ₹{account.balances.available?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Sync Transactions Button */}
            {transactions.length === 0 && (
              <button
                onClick={fetchTransactions}
                disabled={loading}
                className="mt-4 w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
              >
                {loading ? '⏳ Loading...' : '🔄 Fetch Transactions'}
              </button>
            )}
          </div>
        )}

        {/* Transactions Section */}
        {transactions.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                 Recent Transactions ({transactions.length})
              </h2>
              <button
                onClick={fetchTransactions}
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                 Refresh
              </button>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {transactions.slice(0, 20).map((txn) => (
                <div
                  key={txn.transaction_id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {txn.name}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {txn.date}
                      </p>
                      {txn.merchant_name && (
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {txn.merchant_name}
                        </p>
                      )}
                      {txn.pending && (
                        <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs rounded-full">
                          Pending
                        </span>
                      )}
                    </div>
                    {txn.category && txn.category.length > 0 && (
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {txn.category.join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <p className={`text-lg font-bold ${
                      txn.amount > 0 
                        ? 'text-red-600 dark:text-red-400' 
                        : 'text-green-600 dark:text-green-400'
                    }`}>
                      {txn.amount > 0 ? '-' : '+'}₹{Math.abs(txn.amount).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && accounts.length === 0 && (
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
            <div className="text-6xl mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Banks Connected
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Click "Connect Bank Account" above to get started with the demo
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BankConnection;