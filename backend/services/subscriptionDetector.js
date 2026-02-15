const Expense = require('../models/Expense');
const Subscription = require('../models/Subscription');

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

// Find recurring patterns in expenses
async function detectRecurringTransactions(userId) {
  try {
    // Get expenses from last 120 days (extended from 90)
    const twoHundredDaysAgo = new Date();
    twoHundredDaysAgo.setDate(twoHundredDaysAgo.getDate() - 120);

    const expenses = await Expense.find({
      userId: userId,
      date: { $gte: twoHundredDaysAgo },
    }).sort({ date: -1 });

    console.log(`[Subscription Detection] Found ${expenses.length} expenses from last 120 days`);

    const subscriptions = [];
    const processedMerchants = new Set();

    // Group by merchant/title
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
    console.log(`[Subscription Detection] Merchant groups:`, Object.keys(merchantGroups));

    // Analyze each merchant group
    for (const [merchantKey, transactions] of Object.entries(merchantGroups)) {
      if (processedMerchants.has(merchantKey)) continue;
      if (transactions.length < 2) {
        console.log(`[Subscription Detection] Skipping "${merchantKey}" - only ${transactions.length} transaction(s)`);
        continue;
      }

      console.log(`\n[Subscription Detection] Analyzing "${merchantKey}" with ${transactions.length} transactions`);

      // Check if amounts are similar (within 20% variance for flexibility)
      const amounts = transactions.map(t => {
        const amt = typeof t.amount === 'string' ? parseFloat(t.amount) : t.amount;
        return isNaN(amt) ? 0 : amt;
      });
      
      console.log(`[Subscription Detection] Amounts for "${merchantKey}":`, amounts);
      
      const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      
      // Calculate variance more intelligently
      const maxAmount = Math.max(...amounts);
      const minAmount = Math.min(...amounts);
      const variance = minAmount > 0 ? ((maxAmount - minAmount) / minAmount) * 100 : 0;
      
      console.log(`[Subscription Detection] Amount variance for "${merchantKey}": ${variance.toFixed(2)}% (min: ${minAmount}, max: ${maxAmount}, avg: ${avgAmount})`);
      
      // For subscriptions, variance should be low, but allow up to 25% for edge cases
      let amountsAreSimilar = variance <= 25;
      console.log(`[Subscription Detection] Amounts similar? ${amountsAreSimilar}`);

      // Sort dates (oldest first)
      const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
      const dates = sortedTransactions.map(t => new Date(t.date));
      
      console.log(`[Subscription Detection] Dates for "${merchantKey}":`, dates.map(d => d.toISOString().split('T')[0]));
      
      const intervals = [];
      
      for (let i = 1; i < dates.length; i++) {
        const daysBetween = (dates[i] - dates[i-1]) / (1000 * 60 * 60 * 24);
        intervals.push(Math.round(daysBetween * 10) / 10);
      }

      const avgInterval = intervals.length > 0 ? intervals.reduce((a, b) => a + b, 0) / intervals.length : 0;
      const maxInterval = intervals.length > 0 ? Math.max(...intervals) : 0;
      const minInterval = intervals.length > 0 ? Math.min(...intervals) : 0;
      
      console.log(`[Subscription Detection] Intervals for "${merchantKey}":`, intervals, `(avg: ${avgInterval.toFixed(1)}, min: ${minInterval.toFixed(1)}, max: ${maxInterval.toFixed(1)})`);
      
      // Determine frequency based on intervals
      let frequency = 'monthly';
      let nextBillingDays = 30;
      let isRecurring = false;

      // IMPROVED DETECTION LOGIC:
      
      // Priority Case: 3+ transactions with same/similar name and amount = HIGH CONFIDENCE SUBSCRIPTION
      if (transactions.length >= 3 && amountsAreSimilar) {
        console.log(`[Subscription Detection] ✓ DETECTED: "${merchantKey}" - 3+ transactions with similar amounts`);
        // This is the strongest signal - 3+ payments suggests subscription
        // Infer frequency from intervals if available
        if (intervals.length >= 2) {
          if (avgInterval >= 25 && avgInterval <= 35) {
            frequency = 'monthly';
            nextBillingDays = 30;
          } else if (avgInterval >= 350 && avgInterval <= 375) {
            frequency = 'yearly';
            nextBillingDays = 365;
          } else if (avgInterval >= 5 && avgInterval <= 9) {
            frequency = 'weekly';
            nextBillingDays = 7;
          } else if (avgInterval >= 1 && avgInterval <= 3) {
            frequency = 'daily';
            nextBillingDays = 1;
          } else {
            // If interval doesn't match standard patterns, still confident it's recurring
            frequency = 'monthly';
            nextBillingDays = 30;
          }
        } else {
          // Check for monthly pattern (e.g., same date each month)
          if (detectMonthlyPattern(dates)) {
            frequency = 'monthly';
            nextBillingDays = 30;
          } else {
            frequency = 'monthly';
            nextBillingDays = 30;
          }
        }
        isRecurring = true;
      }
      // Case 1: Same day recurring (0 days interval)
      else if (maxInterval <= 1 && transactions.length >= 2 && amountsAreSimilar) {
        console.log(`[Subscription Detection] ✓ DETECTED: "${merchantKey}" - Same day recurring`);
        frequency = 'monthly';
        nextBillingDays = 30;
        isRecurring = true;
      }
      // Case 2: Weekly pattern (5-9 days) with 2+ transactions
      else if (transactions.length >= 2 && avgInterval >= 5 && avgInterval <= 9 && amountsAreSimilar) {
        console.log(`[Subscription Detection] ✓ DETECTED: "${merchantKey}" - Weekly pattern`);
        frequency = 'weekly';
        nextBillingDays = 7;
        isRecurring = true;
      }
      // Case 3: Monthly pattern (23-37 days to account for different month lengths)
      else if (transactions.length >= 2 && avgInterval >= 23 && avgInterval <= 37 && amountsAreSimilar) {
        console.log(`[Subscription Detection] ✓ DETECTED: "${merchantKey}" - Monthly pattern`);
        frequency = 'monthly';
        nextBillingDays = 30;
        isRecurring = true;
      }
      // Case 4: Yearly pattern (350-380 days)
      else if (transactions.length >= 2 && avgInterval >= 350 && avgInterval <= 380 && amountsAreSimilar) {
        console.log(`[Subscription Detection] ✓ DETECTED: "${merchantKey}" - Yearly pattern`);
        frequency = 'yearly';
        nextBillingDays = 365;
        isRecurring = true;
      }
      // Case 5: Odd interval but 3+ transactions with same amount = still recurring
      else if (transactions.length >= 3 && amounts.every(amt => amt === amounts[0])) {
        console.log(`[Subscription Detection] ✓ DETECTED: "${merchantKey}" - 3+ with identical amounts`);
        frequency = 'monthly';
        nextBillingDays = 30;
        isRecurring = true;
      }

      // Check if it's likely a subscription
      const isSubscription = isLikelySubscription(
        sortedTransactions[0].merchantName,
        sortedTransactions[0].title
      );
      
      // Additional signal: Check if category suggests subscription
      const categoryText = (sortedTransactions[0].category || '').toLowerCase();
      const isCategorySubscription = categoryText.includes('subscription') || 
                                     categoryText.includes('service') ||
                                     categoryText.includes('membership');

      console.log(`[Subscription Detection] isSubscription: ${isSubscription}, isCategorySubscription: ${isCategorySubscription}, isRecurring: ${isRecurring}`);

      if ((isSubscription || isCategorySubscription) || isRecurring) {
        // Calculate next billing date based on last transaction
        const lastTransaction = sortedTransactions[sortedTransactions.length - 1];
        const nextBilling = new Date(lastTransaction.date);
        
        // For better next billing calculation, use the detected interval
        let billingDaysToAdd = nextBillingDays;
        if (intervals.length >= 2 && avgInterval > 0) {
          // Use the average interval for more accuracy
          billingDaysToAdd = Math.round(avgInterval);
        }
        
        nextBilling.setDate(nextBilling.getDate() + billingDaysToAdd);

        console.log(`[Subscription Detection] → Creating subscription: ${merchantKey}, frequency: ${frequency}, nextBilling: ${nextBilling.toISOString().split('T')[0]}`);

        subscriptions.push({
          name: sortedTransactions[0].merchantName || sortedTransactions[0].title,
          amount: Math.round(avgAmount * 100) / 100,
          frequency: frequency,
          nextBillingDate: nextBilling,
          merchantName: sortedTransactions[0].merchantName,
          category: sortedTransactions[0].category || 'Subscription',
          icon: getSubscriptionIcon(merchantKey),
          relatedExpenses: sortedTransactions.map(t => t._id),
          occurrenceCount: sortedTransactions.length,
          totalSpent: Math.round(amounts.reduce((a, b) => a + b, 0) * 100) / 100,
        });

        processedMerchants.add(merchantKey);
      } else {
        console.log(`[Subscription Detection] ✗ Not detected: "${merchantKey}" - no subscription signals`);
      }
    }

    console.log(`\n[Subscription Detection] Total subscriptions detected: ${subscriptions.length}`);

    return subscriptions;
  } catch (error) {
    console.error('Error detecting subscriptions:', error);
    return [];
  }
}

// Get appropriate icon for subscription
function getSubscriptionIcon(merchantName) {
  const name = merchantName.toLowerCase();
  
  const iconMap = {
    'netflix': '🎬',
    'spotify': '🎵',
    'amazon': '📦',
    'hulu': '📺',
    'disney': '🏰',
    'apple': '🍎',
    'youtube': '▶️',
    'gym': '💪',
    'fitness': '🏋️',
    'rent': '🏠',
    'insurance': '🛡️',
    'phone': '📱',
    'internet': '🌐',
    'electricity': '⚡',
    'water': '💧',
    'gas': '🔥',
  };

  for (const [key, icon] of Object.entries(iconMap)) {
    if (name.includes(key)) return icon;
  }

  return '💳';
}

// Save detected subscriptions to database
async function saveSubscriptions(userId, detectedSubscriptions) {
  const saved = [];

  for (const sub of detectedSubscriptions) {
    try {
      // Check if subscription already exists
      const existing = await Subscription.findOne({
        userId: userId,
        name: sub.name,
        status: 'active',
      });

      if (existing) {
        // Update existing subscription
        existing.amount = sub.amount;
        existing.nextBillingDate = sub.nextBillingDate;
        existing.relatedExpenses = sub.relatedExpenses;
        existing.occurrenceCount = sub.occurrenceCount;
        existing.totalSpent = sub.totalSpent;
        existing.frequency = sub.frequency;
        await existing.save();
        saved.push(existing);
      } else {
        // Create new subscription
        const newSub = new Subscription({
          userId: userId,
          ...sub,
          detectionMethod: 'auto',
        });
        await newSub.save();
        saved.push(newSub);
      }
    } catch (error) {
      console.error('Error saving subscription:', error);
    }
  }

  return saved;
}

// Additional smart detection for patterns (e.g., monthly on same date)
function detectMonthlyPattern(dates) {
  if (dates.length < 2) return false;
  
  // Check if transactions occur on similar dates of different months
  const dayOfMonths = dates.map(d => d.getDate());
  const months = dates.map(d => d.getMonth());
  
  // If dates are similar (within 2 days) and in different months, likely monthly
  const minDay = Math.min(...dayOfMonths);
  const maxDay = Math.max(...dayOfMonths);
  
  // Check if days are close (e.g., all around 15th of month)
  if ((maxDay - minDay) <= 2) {
    // Check if they're in different months
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