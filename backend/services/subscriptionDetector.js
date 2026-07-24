const prisma = require('../config/prismaClient');

const SUBSCRIPTION_KEYWORDS = [
  'netflix', 'spotify', 'amazon prime', 'hulu', 'disney+', 'apple music',
  'youtube premium', 'linkedin', 'adobe', 'microsoft', 'google one',
  'dropbox', 'icloud', 'github', 'chatgpt', 'canva', 'grammarly',
  'gym', 'fitness', 'insurance', 'rent', 'mortgage', 'phone', 'internet',
  'electricity', 'water', 'gas', 'subscription', 'aws', 'azure', 'stripe',
  'twitch', 'crunchyroll', 'paramount', 'apple tv', 'max', 'peacock',
  'notion', 'figma', 'slack', 'asana', 'jira', 'confluence',
  'monthly', 'recurring', 'membership', 'plan', 'premium', 'pro',
  'wix', 'shopify', 'squarespace', 'weebly', 'newsletter', 'substack',
  'patreon', 'onlyfans', 'audible', 'scribd', 'masterclass',
  'cable', 'wifi', 'broadband', 'vpn', 'cloud', 'storage',
  'bill', 'charge', 'verizon', 'att', 'comcast', 'spectrum',
  'heating', 'cooling', 'utility', 'waste', 'trash', 'recycling'
];

function isLikelySubscription(merchantName, title) {
  if (!merchantName && !title) return false;

  const text = `${merchantName || ''} ${title || ''}`.toLowerCase();

  const keywordMatch = SUBSCRIPTION_KEYWORDS.some(keyword => text.includes(keyword));

  const isExplicitlyRecurring = text.includes('recurring') || text.includes('daily') ||
                                text.includes('weekly') || text.includes('monthly') ||
                                text.includes('yearly') || text.includes('annual');

  return keywordMatch || isExplicitlyRecurring;
}

async function detectRecurringTransactions(userId) {
  try {
    const oneHundredTwentyDaysAgo = new Date();
    oneHundredTwentyDaysAgo.setDate(oneHundredTwentyDaysAgo.getDate() - 120);

    const expenses = await prisma.expense.findMany({
      where: {
        userId: userId,
        date: { gte: oneHundredTwentyDaysAgo },
      },
      orderBy: { date: 'desc' },
    });

    console.log(`[Subscription Detection] Found ${expenses.length} expenses from last 120 days`);

    const subscriptions = [];
    const processedMerchants = new Set();

    const merchantGroups = {};

    expenses.forEach(expense => {
      const key = expense.merchantName || expense.title;
      if (!key) return;

      const normalizedKey = key.toLowerCase().trim();

      if (!merchantGroups[normalizedKey]) {
        merchantGroups[normalizedKey] = [];
      }

      merchantGroups[normalizedKey].push(expense);
    });

    console.log(`[Subscription Detection] Grouped into ${Object.keys(merchantGroups).length} unique merchants`);

    for (const [merchantKey, transactions] of Object.entries(merchantGroups)) {
      if (processedMerchants.has(merchantKey)) continue;
      if (transactions.length < 2) {
        console.log(`[Subscription Detection] Skipping "${merchantKey}" - only ${transactions.length} transaction(s)`);
        continue;
      }

      console.log(`\n[Subscription Detection] Analyzing "${merchantKey}" with ${transactions.length} transactions`);

      const amounts = transactions.map(t => {
        const amt = typeof t.amount === 'string' ? parseFloat(t.amount) : Number(t.amount);
        return isNaN(amt) ? 0 : amt;
      });

      const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      const maxAmount = Math.max(...amounts);
      const minAmount = Math.min(...amounts);
      const variance = minAmount > 0 ? ((maxAmount - minAmount) / minAmount) * 100 : 0;

      let amountsAreSimilar = variance <= 25;

      const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
      const dates = sortedTransactions.map(t => new Date(t.date));

      const intervals = [];
      for (let i = 1; i < dates.length; i++) {
        const daysBetween = (dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24);
        intervals.push(Math.round(daysBetween * 10) / 10);
      }

      const avgInterval = intervals.length > 0 ? intervals.reduce((a, b) => a + b, 0) / intervals.length : 0;
      const maxInterval = intervals.length > 0 ? Math.max(...intervals) : 0;

      let frequency = 'monthly';
      let nextBillingDays = 30;
      let isRecurring = false;

      if (transactions.length >= 3 && amountsAreSimilar) {
        if (intervals.length >= 2) {
          if (avgInterval >= 25 && avgInterval <= 35) {
            frequency = 'monthly'; nextBillingDays = 30;
          } else if (avgInterval >= 350 && avgInterval <= 375) {
            frequency = 'yearly'; nextBillingDays = 365;
          } else if (avgInterval >= 5 && avgInterval <= 9) {
            frequency = 'weekly'; nextBillingDays = 7;
          } else if (avgInterval >= 1 && avgInterval <= 3) {
            frequency = 'daily'; nextBillingDays = 1;
          } else {
            frequency = 'monthly'; nextBillingDays = 30;
          }
        } else {
          frequency = 'monthly'; nextBillingDays = 30;
        }
        isRecurring = true;
      }
      else if (maxInterval <= 1 && transactions.length >= 2 && amountsAreSimilar) {
        frequency = 'monthly'; nextBillingDays = 30; isRecurring = true;
      }
      else if (transactions.length >= 2 && avgInterval >= 5 && avgInterval <= 9 && amountsAreSimilar) {
        frequency = 'weekly'; nextBillingDays = 7; isRecurring = true;
      }
      else if (transactions.length >= 2 && avgInterval >= 23 && avgInterval <= 37 && amountsAreSimilar) {
        frequency = 'monthly'; nextBillingDays = 30; isRecurring = true;
      }
      else if (transactions.length >= 2 && avgInterval >= 350 && avgInterval <= 380 && amountsAreSimilar) {
        frequency = 'yearly'; nextBillingDays = 365; isRecurring = true;
      }
      else if (transactions.length >= 3 && amounts.every(amt => amt === amounts[0])) {
        frequency = 'monthly'; nextBillingDays = 30; isRecurring = true;
      }

      const isSubscription = isLikelySubscription(
        sortedTransactions[0].merchantName,
        sortedTransactions[0].title
      );

      const categoryText = (sortedTransactions[0].category || '').toLowerCase();
      const isCategorySubscription = categoryText.includes('subscription') ||
                                     categoryText.includes('service') ||
                                     categoryText.includes('membership');

      if ((isSubscription || isCategorySubscription) || isRecurring) {
        const lastTransaction = sortedTransactions[sortedTransactions.length - 1];
        const nextBilling = new Date(lastTransaction.date);

        let billingDaysToAdd = nextBillingDays;
        if (intervals.length >= 2 && avgInterval > 0) {
          billingDaysToAdd = Math.round(avgInterval);
        }

        nextBilling.setDate(nextBilling.getDate() + billingDaysToAdd);

        subscriptions.push({
          name: sortedTransactions[0].merchantName || sortedTransactions[0].title,
          amount: Math.round(avgAmount * 100) / 100,
          frequency: frequency,
          nextBillingDate: nextBilling,
          merchantName: sortedTransactions[0].merchantName,
          category: sortedTransactions[0].category || 'Subscription',
          icon: getSubscriptionIcon(merchantKey),
          relatedExpenseIds: sortedTransactions.map(t => t.id),
          occurrenceCount: sortedTransactions.length,
          totalSpent: Math.round(amounts.reduce((a, b) => a + b, 0) * 100) / 100,
        });

        processedMerchants.add(merchantKey);
      }
    }

    console.log(`\n[Subscription Detection] Total subscriptions detected: ${subscriptions.length}`);

    return subscriptions;
  } catch (error) {
    console.error('Error detecting subscriptions:', error);
    return [];
  }
}

function getSubscriptionIcon(merchantName) {
  const name = merchantName.toLowerCase();

  const iconMap = {
    'netflix': '🎬', 'spotify': '🎵', 'amazon': '📦', 'hulu': '📺',
    'disney': '🏰', 'apple': '🍎', 'youtube': '▶️', 'gym': '💪',
    'fitness': '🏋️', 'rent': '🏠', 'insurance': '🛡️', 'phone': '📱',
    'internet': '🌐', 'electricity': '⚡', 'water': '💧', 'gas': '🔥',
  };

  for (const [key, icon] of Object.entries(iconMap)) {
    if (name.includes(key)) return icon;
  }

  return '💳';
}

async function saveSubscriptions(userId, detectedSubscriptions) {
  const saved = [];

  for (const sub of detectedSubscriptions) {
    try {
      const existing = await prisma.subscription.findFirst({
        where: {
          userId: userId,
          name: sub.name,
          status: 'active',
        },
      });

      if (existing) {
        const updated = await prisma.subscription.update({
          where: { id: existing.id },
          data: {
            amount: sub.amount,
            nextBillingDate: sub.nextBillingDate,
            occurrenceCount: sub.occurrenceCount,
            totalSpent: sub.totalSpent,
            frequency: sub.frequency,
            relatedExpenses: {
              set: sub.relatedExpenseIds.map(id => ({ id })),
            },
          },
        });
        saved.push(updated);
      } else {
        const newSub = await prisma.subscription.create({
          data: {
            userId: sub.userId || userId,
            name: sub.name,
            amount: sub.amount,
            frequency: sub.frequency,
            nextBillingDate: sub.nextBillingDate,
            merchantName: sub.merchantName,
            category: sub.category,
            icon: sub.icon,
            occurrenceCount: sub.occurrenceCount,
            totalSpent: sub.totalSpent,
            detectionMethod: 'auto',
            relatedExpenses: {
              connect: sub.relatedExpenseIds.map(id => ({ id })),
            },
          },
        });
        saved.push(newSub);
      }
    } catch (error) {
      console.error('Error saving subscription:', error);
    }
  }

  return saved;
}

function detectMonthlyPattern(dates) {
  if (dates.length < 2) return false;

  const dayOfMonths = dates.map(d => d.getDate());
  const months = dates.map(d => d.getMonth());

  const minDay = Math.min(...dayOfMonths);
  const maxDay = Math.max(...dayOfMonths);

  if ((maxDay - minDay) <= 2) {
    const uniqueMonths = new Set(months).size;
    if (uniqueMonths >= 2) {
      return true;
    }
  }

  return false;
}

module.exports = {
  detectRecurringTransactions,
  saveSubscriptions,
  isLikelySubscription,
  detectMonthlyPattern,
};