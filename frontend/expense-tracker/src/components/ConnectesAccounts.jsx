import React, { useState, useEffect } from 'react';

const ConnectedAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/plaid/accounts');
      const data = await response.json();
      setAccounts(data.accounts || []);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading accounts...</p>;

  if (accounts.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
        <p>No bank accounts connected yet.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Connected Accounts ({accounts.length})</h2>
      <div style={{ display: 'grid', gap: '16px', marginTop: '16px' }}>
        {accounts.map((account) => (
          <div
            key={account.account_id}
            style={{
              background: 'white',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: '0 0 8px 0' }}>{account.name}</h3>
                <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                  {account.institution_name}
                </p>
              </div>
              <span style={{
                background: '#e0e7ff',
                color: '#667eea',
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '12px',
                textTransform: 'uppercase',
              }}>
                {account.type}
              </span>
            </div>
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '16px 0 0 0' }}>
              ${account.balances.current?.toFixed(2) || '0.00'}
            </p>
            <p style={{ fontSize: '14px', color: '#666', margin: '4px 0 0 0' }}>
              Available: ${account.balances.available?.toFixed(2) || '0.00'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConnectedAccounts;