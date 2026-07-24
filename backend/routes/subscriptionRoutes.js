const express = require('express');
const router = express.Router();
const prisma = require('../config/prismaClient');
const { protect } = require('../middleware/authMiddleware');
const { detectRecurringTransactions, saveSubscriptions } = require('../services/subscriptionDetector');

router.get('/', protect, async (req, res) => {
  try {
    const subscriptions = await prisma.subscription.findMany({
      where: { userId: req.user.id, status: 'active' },
      orderBy: { nextBillingDate: 'asc' },
    });

    const monthlyTotal = subscriptions.reduce((total, sub) => {
      let monthlyAmount = Number(sub.amount);

      if (sub.frequency === 'weekly') monthlyAmount = Number(sub.amount) * 4;
      else if (sub.frequency === 'yearly') monthlyAmount = Number(sub.amount) / 12;
      else if (sub.frequency === 'daily') monthlyAmount = Number(sub.amount) * 30;

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

    const detected = await detectRecurringTransactions(req.user.id);
    const saved = await saveSubscriptions(req.user.id, detected);

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
    const oneHundredTwentyDaysAgo = new Date();
    oneHundredTwentyDaysAgo.setDate(oneHundredTwentyDaysAgo.getDate() - 120);

    const expenses = await prisma.expense.findMany({
      where: { userId: req.user.id, date: { gte: oneHundredTwentyDaysAgo } },
      orderBy: { date: 'desc' },
    });

    console.log(`[DEBUG] Found ${expenses.length} expenses`);
    expenses.forEach(exp => {
      console.log(`[DEBUG] ${exp.title || exp.merchantName}: $${exp.amount} on ${exp.date.toISOString().split('T')[0]}, category: ${exp.category}`);
    });

    res.json({
      count: expenses.length,
      expenses: expenses.map(e => ({
        id: e.id,
        title: e.title,
        merchantName: e.merchantName,
        amount: e.amount,
        date: e.date,
        category: e.category,
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

    const subscription = await prisma.subscription.create({
      data: {
        userId: req.user.id,
        name,
        amount,
        frequency,
        nextBillingDate: new Date(nextBillingDate),
        category: category || 'Subscription',
        icon: icon || '💳',
        detectionMethod: 'manual',
      },
    });

    res.json({ success: true, subscription });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const subscription = await prisma.subscription.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    const updated = await prisma.subscription.update({
      where: { id: subscription.id },
      data: req.body,
    });

    res.json({ success: true, subscription: updated });
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const subscription = await prisma.subscription.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: 'cancelled' },
    });

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

    const upcoming = await prisma.subscription.findMany({
      where: {
        userId: req.user.id,
        status: 'active',
        nextBillingDate: { lte: sevenDaysFromNow },
      },
      orderBy: { nextBillingDate: 'asc' },
    });

    res.json({ upcoming });
  } catch (error) {
    console.error('Error fetching upcoming bills:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;