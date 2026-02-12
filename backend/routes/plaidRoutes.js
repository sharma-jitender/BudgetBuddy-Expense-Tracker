const express = require('express');
const router = express.Router();
const plaidClient = require('../config/plaid');
const PlaidItem = require('../models/PlaidItem');
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const { protect } = require('../middleware/auth'); // Your auth middleware

// 1. Create Link Token
router.post('/create_link_token', protect, async (req, res) => {
  try {
    const request = {
      user: {
        client_user_id: req.user._id.toString(),
      },
      client_name: 'ExpenseTracker',
      products: ['transactions'],
      country_codes: ['US'],
      language: 'en',
    };

    const response = await plaidClient.linkTokenCreate(request);
    res.json({ link_token: response.data.link_token });
  } catch (error) {
    console.error('Error creating link token:', error);
    res.status(500).json({ error: error.message });
  }
});

// 2. Exchange Public Token & Save to DB
router.post('/exchange_public_token', protect, async (req, res) => {
  try {
    const { public_token, institution } = req.body;

    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token: public_token,
    });

    const accessToken = exchangeResponse.data.access_token;
    const itemId = exchangeResponse.data.item_id;

    const accountsResponse = await plaidClient.accountsGet({
      access_token: accessToken,
    });

    const plaidItem = new PlaidItem({
      userId: req.user._id,
      accessToken: accessToken,
      itemId: itemId,
      institutionId: institution?.institution_id,
      institutionName: institution?.name,
      accounts: accountsResponse.data.accounts.map(acc => ({
        accountId: acc.account_id,
        name: acc.name,
        type: acc.type,
        subtype: acc.subtype,
        mask: acc.mask,
      })),
      status: 'active',
    });

    await plaidItem.save();

    res.json({ 
      success: true, 
      item_id: itemId,
      institution: institution?.name,
    });
  } catch (error) {
    console.error('Error exchanging token:', error);
    res.status(500).json({ error: error.message });
  }
});

// 3. Get User's Connected Accounts
router.get('/accounts', protect, async (req, res) => {
  try {
    const plaidItems = await PlaidItem.find({ 
      userId: req.user._id,
      status: 'active',
    });

    if (plaidItems.length === 0) {
      return res.json({ accounts: [] });
    }

    const allAccounts = [];

    for (const item of plaidItems) {
      try {
        const response = await plaidClient.accountsBalanceGet({
          access_token: item.accessToken,
        });

        const accounts = response.data.accounts.map(account => ({
          ...account,
          institution_name: item.institutionName,
          plaid_item_id: item._id,
        }));

        allAccounts.push(...accounts);
      } catch (error) {
        console.error(`Error fetching accounts for item ${item.itemId}:`, error);
        item.status = 'error';
        await item.save();
      }
    }

    res.json({ accounts: allAccounts });
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ error: error.message });
  }
});

// 4. Sync Transactions & Save to DB
router.post('/transactions/sync', protect, async (req, res) => {
  try {
    const plaidItems = await PlaidItem.find({ 
      userId: req.user._id,
      status: 'active',
    });

    if (plaidItems.length === 0) {
      return res.json({ message: 'No connected banks', synced: 0 });
    }

    let totalSynced = 0;
    let incomeCount = 0;
    let expenseCount = 0;

    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    const startDateStr = startDate.toISOString().split('T')[0];

    for (const item of plaidItems) {
      try {
        const request = {
          access_token: item.accessToken,
          start_date: startDateStr,
          end_date: endDate,
        };

        const response = await plaidClient.transactionsGet(request);
        let transactions = response.data.transactions;

        // Handle pagination
        const totalTransactions = response.data.total_transactions;
        while (transactions.length < totalTransactions) {
          const paginatedRequest = {
            ...request,
            offset: transactions.length,
          };
          const paginatedResponse = await plaidClient.transactionsGet(paginatedRequest);
          transactions = transactions.concat(paginatedResponse.data.transactions);
        }

        // Save transactions to database
        for (const txn of transactions) {
          // Plaid: positive amount = expense, negative = income
          const isExpense = txn.amount > 0;
          const Model = isExpense ? Expense : Income;

          // Check if transaction already exists
          const existingTxn = await Model.findOne({
            plaidTransactionId: txn.transaction_id,
          });

          if (existingTxn) {
            // Update if status changed
            if (existingTxn.pending !== txn.pending || existingTxn.amount !== Math.abs(txn.amount)) {
              existingTxn.pending = txn.pending;
              existingTxn.amount = Math.abs(txn.amount);
              await existingTxn.save();
            }
          } else {
            // Map Plaid category to your categories
            const category = mapPlaidCategory(txn.category);

            // Create new transaction
            const newTransaction = new Model({
              userId: req.user._id,
              plaidTransactionId: txn.transaction_id,
              plaidAccountId: txn.account_id,
              title: txn.merchant_name || txn.name,
              amount: Math.abs(txn.amount),
              category: category,
              date: new Date(txn.date),
              merchantName: txn.merchant_name,
              pending: txn.pending,
              source: 'plaid',
              icon: getCategoryIcon(category),
            });

            await newTransaction.save();
            totalSynced++;
            
            if (isExpense) expenseCount++;
            else incomeCount++;
          }
        }

        // Update last synced timestamp
        item.lastSynced = new Date();
        await item.save();

      } catch (error) {
        console.error(`Error syncing transactions for item ${item.itemId}:`, error);
      }
    }

    res.json({ 
      success: true,
      synced: totalSynced,
      income: incomeCount,
      expenses: expenseCount,
      message: `Synced ${totalSynced} new transactions (${incomeCount} income, ${expenseCount} expenses)`,
    });
  } catch (error) {
    console.error('Error syncing transactions:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper function to map Plaid categories to your app's categories
function mapPlaidCategory(plaidCategories) {
  if (!plaidCategories || plaidCategories.length === 0) return 'Other';
  
  const categoryMap = {
    'Food and Drink': 'food',
    'Restaurants': 'food',
    'Fast Food': 'food',
    'Coffee Shop': 'food',
    'Groceries': 'groceries',
    'Shops': 'shopping',
    'General Merchandise': 'shopping',
    'Payment': 'bills',
    'Credit Card': 'bills',
    'Transfer': 'transfer',
    'Travel': 'transport',
    'Gas Stations': 'transport',
    'Public Transportation': 'transport',
    'Taxi': 'transport',
    'Healthcare': 'health',
    'Entertainment': 'entertainment',
    'Gyms and Fitness Centers': 'health',
    'Rent': 'housing',
    // Add more based on your app's categories
  };
  
  const plaidCategory = plaidCategories[0];
  return categoryMap[plaidCategory] || 'other';
}

// Helper function to get icon for category
function getCategoryIcon(category) {
  const iconMap = {
    'food': '🍔',
    'groceries': '🛒',
    'shopping': '🛍️',
    'transport': '🚗',
    'bills': '💳',
    'health': '🏥',
    'entertainment': '🎬',
    'housing': '🏠',
    'other': '📝',
  };
  
  return iconMap[category.toLowerCase()] || '📝';
}

// 5. Get Status
router.get('/status', protect, async (req, res) => {
  try {
    const plaidItems = await PlaidItem.find({ userId: req.user._id });

    res.json({
      environment: process.env.PLAID_ENV,
      connected_items: plaidItems.length,
      items: plaidItems.map(item => ({
        institution: item.institutionName,
        status: item.status,
        last_synced: item.lastSynced,
        accounts: item.accounts.length,
      })),
    });
  } catch (error) {
    console.error('Error fetching status:', error);
    res.status(500).json({ error: error.message });
  }
});

// 6. Disconnect Bank
router.delete('/item/:item_id', protect, async (req, res) => {
  try {
    const plaidItem = await PlaidItem.findOne({
      _id: req.params.item_id,
      userId: req.user._id,
    });

    if (!plaidItem) {
      return res.status(404).json({ error: 'Bank connection not found' });
    }

    await plaidClient.itemRemove({
      access_token: plaidItem.accessToken,
    });

    await plaidItem.deleteOne();

    res.json({ success: true });
  } catch (error) {
    console.error('Error removing item:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;