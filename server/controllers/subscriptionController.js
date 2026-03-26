const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const Charity = require('../models/Charity');

/**
 * POST /api/subscriptions/create-checkout
 * Creates a Stripe Checkout Session for monthly or yearly plan
 */
const createCheckoutSession = async (req, res) => {
  try {
    const { planType } = req.body; // 'monthly' | 'yearly'
    const user = req.user;
    if (user.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Admins cannot create subscriptions' });
    }

    const priceId =
      planType === 'yearly'
        ? process.env.STRIPE_YEARLY_PRICE_ID
        : process.env.STRIPE_MONTHLY_PRICE_ID;

    if (!priceId)
      return res.status(400).json({ success: false, message: 'Invalid plan type' });

    // Create or retrieve Stripe customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: user._id.toString() },
      });
      customerId = customer.id;
      await User.findByIdAndUpdate(user._id, { stripeCustomerId: customerId });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.CLIENT_URL}/dashboard?subscribed=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/subscribe?cancelled=true`,
      metadata: { userId: user._id.toString(), planType },
    });

    res.json({ success: true, url: session.url, sessionId: session.id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/subscriptions/webhook
 * Handles Stripe webhook events to sync subscription status
 * NOTE: body must be raw (not parsed by express.json)
 */
const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ message: `Webhook Error: ${err.message}` });
  }

  try {
    const { type, data } = event;
    const obj = data.object;

    switch (type) {
      case 'checkout.session.completed': {
        const session = obj;
        const userId = session.metadata.userId;
        if (userId) {
          await User.findByIdAndUpdate(userId, { subscriptionStatus: 'active' });
        }
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = obj;
        const customer = await stripe.customers.retrieve(sub.customer);
        const userId = customer.metadata.userId;

        const planType =
          sub.items.data[0].price.id === process.env.STRIPE_YEARLY_PRICE_ID
            ? 'yearly'
            : 'monthly';

        await Subscription.findOneAndUpdate(
          { stripeSubscriptionId: sub.id },
          {
            userId,
            planType,
            status: sub.status === 'active' ? 'active' : sub.status,
            stripeSubscriptionId: sub.id,
            stripeCustomerId: sub.customer,
            stripePriceId: sub.items.data[0].price.id,
            currentPeriodStart: new Date(sub.current_period_start * 1000),
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
            cancelAtPeriodEnd: sub.cancel_at_period_end,
            amount: sub.items.data[0].price.unit_amount,
          },
          { upsert: true, new: true }
        );

        // Sync status on User document
        const user = await User.findByIdAndUpdate(userId, {
          stripeCustomerId: sub.customer,
          subscriptionStatus: sub.status === 'active' ? 'active' : sub.status,
        });

        // If new subscription and first payment, increment charity totals
        // Note: For a more robust system, this should happen on invoice.payment_succeeded
        if (sub.status === 'active' && user && user.selectedCharity) {
          const donationAmount = Math.floor((sub.items.data[0].price.unit_amount * (user.charityContributionPct || 10)) / 100);
          await User.findByIdAndUpdate(userId, { $inc: { totalDonated: donationAmount } });
          await Charity.findByIdAndUpdate(user.selectedCharity, {
             $inc: { totalDonations: donationAmount }
          });
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = obj;
        const customer = await stripe.customers.retrieve(sub.customer);
        const userId = customer.metadata.userId;

        await Subscription.findOneAndUpdate(
          { stripeSubscriptionId: sub.id },
          { status: 'cancelled', cancelledAt: new Date() }
        );
        await User.findByIdAndUpdate(userId, { subscriptionStatus: 'cancelled' });
        break;
      }
      case 'invoice.payment_failed': {
        const customerId = obj.customer;
        const customer = await stripe.customers.retrieve(customerId);
        await User.findByIdAndUpdate(customer.metadata.userId, {
          subscriptionStatus: 'past_due',
        });
        break;
      }
      default:
        break;
    }

    res.json({ received: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/subscriptions/cancel
 * Cancel subscription at period end (doesn't immediately deactivate)
 */
const cancelSubscription = async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Admins cannot perform subscription actions' });
    }
    const sub = await Subscription.findOne({ userId: req.user._id, status: 'active' });
    if (!sub)
      return res.status(404).json({ success: false, message: 'No active subscription found' });

    await stripe.subscriptions.update(sub.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });
    await Subscription.findByIdAndUpdate(sub._id, { cancelAtPeriodEnd: true });

    res.json({ success: true, message: 'Subscription will cancel at end of billing period' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/subscriptions/status
 * Return current subscription details for the logged-in user
 */
const getSubscriptionStatus = async (req, res) => {
  try {
    const sub = await Subscription.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, subscription: sub });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/subscriptions/verify-session
 * Manually fulfills the subscription by querying Stripe. Failsafe for missing local webhooks.
 */
const verifySession = async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Admins cannot perform subscription actions' });
    }
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ success: false, message: 'Missing session ID' });

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session || session.payment_status !== 'paid') {
      return res.status(400).json({ success: false, message: 'Session not paid or invalid' });
    }

    // 3. Update User Status and Charity Donations
    const user = await User.findById(session.metadata.userId);
    if (user) {
      const oldStatus = user.subscriptionStatus;
      user.subscriptionStatus = 'active';
      user.stripeCustomerId = session.customer;
      user.stripeSubscriptionId = session.subscription;

      // Calculate charity donation (10% or user preference)
      const amountPaid = session.amount_total; // in cents
      const donationAmount = Math.floor((amountPaid * (user.charityContributionPct || 10)) / 100); // Default to 10% if not set

      user.totalDonated += donationAmount;
      await user.save();

      // Update Charity totals
      if (user.selectedCharity) {
        await Charity.findByIdAndUpdate(user.selectedCharity, {
          $inc: { totalDonations: donationAmount }
        });
      }

      console.log(`✅ Subscription verified for ${user.email}. Donation: ₹${(donationAmount / 100).toFixed(2)}`);
    }

    if (session.subscription) {
      const sub = await stripe.subscriptions.retrieve(session.subscription);
      const planType = session.metadata.planType || 'monthly';

      await Subscription.findOneAndUpdate(
        { stripeSubscriptionId: sub.id },
        {
          userId: user._id, // Use the user._id from the fetched user
          planType,
          status: sub.status === 'active' ? 'active' : sub.status,
          stripeSubscriptionId: sub.id,
          stripeCustomerId: sub.customer,
          stripePriceId: sub.items.data[0].price.id,
          currentPeriodStart: new Date(sub.current_period_start * 1000),
          currentPeriodEnd: new Date(sub.current_period_end * 1000),
          cancelAtPeriodEnd: sub.cancel_at_period_end,
          amount: sub.items.data[0].price.unit_amount,
        },
        { upsert: true, new: true }
      );
    }

    res.json({ success: true, message: 'Subscription securely verified via session playback' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createCheckoutSession, handleWebhook, cancelSubscription, getSubscriptionStatus, verifySession };
