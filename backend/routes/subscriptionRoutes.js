const express = require('express');
const router = express.Router();
const Subscription = require('../models/Subscription');
const Expense = require('../models/Expense');
const { protect } = require('../middleware/authMiddleware');
const { detectRecurringTransactions, saveSubscriptions } = require('../services/subscriptionDetector');

router.get('/', protect, async (req, res) => {
  try {
    const subscriptions = await Subscription.find({
      userId: req.user._id,
      status: 'active',
    }).sort({ nextBillingDate: 1 });

    const monthlyTotal = subscriptions.reduce((total, sub) => {
      let monthlyAmount = sub.amount;
      
      if (sub.frequency === 'weekly') monthlyAmount = sub.amount * 4;
      else if (sub.frequency === 'yearly') monthlyAmount = sub.amount / 12;
      else if (sub.frequency === 'daily') monthlyAmount = sub.amount * 30;
      
      return total + monthlyAmount;
    }, 0);

    res.json({
      subscriptions,
      totalMonthly: monthlyTotal,
      count: subscriptions.length,
    });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/detect', protect, async (req, res) => {
  try {
    console.log('Detecting subscriptions...');
    
    const detected = await detectRecurringTransactions(req.user._id);
    const saved = await saveSubscriptions(req.user._id, detected);

    console.log(`Subscriptions detected: ${detected.length}, saved: ${saved.length}`);

    res.json({
      detected: detected.length,
      saved: saved.length,
      subscriptions: saved,
    });
  } catch (error) {
    console.error('Error detecting subscriptions:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/debug/expenses', protect, async (req, res) => {
  try {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 120);

    const expenses = await Expense.find({
      userId: req.user._id,
      date: { $gte: ninetyDaysAgo },
    }).sort({ date: -1 });

    console.log(`[DEBUG] Found ${expenses.length} expenses`);
    expenses.forEach(exp => {
      console.log(`[DEBUG] ${exp.title || exp.merchantName}: $${exp.amount} on ${exp.date.toISOString().split('T')[0]}, dataSource: ${exp.dataSource}, category: ${exp.category}`);
    });

    res.json({
      count: expenses.length,
      expenses: expenses.map(e => ({
        _id: e._id,
        title: e.title,
        merchantName: e.merchantName,
        amount: e.amount,
        date: e.date,
        category: e.category,
        dataSource: e.dataSource,
      })),
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { name, amount, frequency, nextBillingDate, category, icon } = req.body;

    const subscription = new Subscription({
      userId: req.user._id,
      name,
      amount,
      frequency,
      nextBillingDate: new Date(nextBillingDate),
      category: category || 'Subscription',
      icon: icon || '💳',
      detectionMethod: 'manual',
    });

    await subscription.save();

    res.json({ success: true, subscription });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    Object.assign(subscription, req.body);
    await subscription.save();

    res.json({ success: true, subscription });
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    subscription.status = 'cancelled';
    await subscription.save();

    res.json({ success: true, message: 'Subscription cancelled' });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/upcoming', protect, async (req, res) => {
  try {
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const upcoming = await Subscription.find({
      userId: req.user._id,
      status: 'active',
      nextBillingDate: { $lte: sevenDaysFromNow },
    }).sort({ nextBillingDate: 1 });

    res.json({ upcoming });
  } catch (error) {
    console.error('Error fetching upcoming bills:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;