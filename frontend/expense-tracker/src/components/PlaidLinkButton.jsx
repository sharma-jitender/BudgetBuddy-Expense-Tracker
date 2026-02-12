import React, { useState, useCallback, useEffect } from 'react';
import { usePlaidLink } from 'react-plaid-link';

const PlaidLinkButton = ({ onSuccess }) => {
  const [linkToken, setLinkToken] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const createLinkToken = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/plaid/create_link_token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        setLinkToken(data.link_token);
        console.log(' Link token created');
      } catch (error) {
        console.error(' Error creating link token:', error);
      }
    };

    createLinkToken();
  }, []);

  const onPlaidSuccess = useCallback(async (public_token, metadata) => {
    setLoading(true);
    try {
      console.log(' Exchanging public token...');
      const response = await fetch('http://localhost:8000/api/plaid/exchange_public_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          public_token,
          institution: metadata.institution,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        console.log(` Successfully connected to ${metadata.institution.name}`);
        alert(` Connected to ${metadata.institution.name}!`);
        onSuccess?.();
      }
    } catch (error) {
      console.error(' Error:', error);
      alert(' Failed to connect bank. Check console for details.');
    } finally {
      setLoading(false);
    }
  }, [onSuccess]);

  const config = {
    token: linkToken,
    onSuccess: onPlaidSuccess,
  };

  const { open, ready } = usePlaidLink(config);

  return (
    <button
      onClick={() => open()}
      disabled={!ready || loading}
      className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg disabled:shadow-none"
    >
      {loading ? 'Connecting...' : ready ? 'Connect Bank Account' : 'Loading...'}
    </button>
  );
};

export default PlaidLinkButton;