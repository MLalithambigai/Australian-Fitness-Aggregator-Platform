const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Payment = require('../models/Payment');
const { protect } = require('../middleware/auth');

// Plan Pricing Constants
const PLAN_PRICES = {
  basic: 49.99,   // AUD
  premium: 79.99, // AUD
  vip: 129.99    // AUD
};

// @route   POST /api/memberships/subscribe
// @desc    Subscribe to a membership plan (creates payment and activates plan)
router.post('/subscribe', protect, async (req, res) => {
  const { planName } = req.body;

  if (!['basic', 'premium', 'vip'].includes(planName)) {
    return res.status(400).json({ message: 'Invalid plan selection. Choose basic, premium, or vip.' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const price = PLAN_PRICES[planName];

    // Create record in Payments collection
    const payment = await Payment.create({
      user: user._id,
      amount: price,
      planName: planName,
      status: 'success'
    });

    // Set membership range (30 days from now)
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 30);

    user.membership = {
      plan: planName,
      status: 'active',
      startDate,
      endDate
    };

    await user.save();

    res.json({
      message: `Successfully subscribed to ${planName.toUpperCase()} plan!`,
      membership: user.membership,
      payment
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/memberships/cancel
// @desc    Cancel membership subscription auto-renewal
router.post('/cancel', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.membership.status !== 'active') {
      return res.status(400).json({ message: 'No active subscription found to cancel.' });
    }

    // Instead of immediate revocation, standard behavior is marking as 'cancelled' until endDate
    user.membership.status = 'cancelled';
    await user.save();

    res.json({
      message: 'Subscription cancelled. Access remains active until subscription period ends.',
      membership: user.membership
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/memberships/upgrade
// @desc    Upgrade or downgrade plan immediately
router.post('/upgrade', protect, async (req, res) => {
  const { planName } = req.body;

  if (!['basic', 'premium', 'vip'].includes(planName)) {
    return res.status(400).json({ message: 'Invalid plan selection.' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const price = PLAN_PRICES[planName];

    // Record payment
    const payment = await Payment.create({
      user: user._id,
      amount: price,
      planName: planName,
      status: 'success'
    });

    // Reset membership range (30 days from now)
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 30);

    user.membership = {
      plan: planName,
      status: 'active',
      startDate,
      endDate
    };

    await user.save();

    res.json({
      message: `Membership updated to ${planName.toUpperCase()} plan!`,
      membership: user.membership,
      payment
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/memberships/transactions
// @desc    Get user's membership payments list
router.get('/transactions', protect, async (req, res) => {
  try {
    const transactions = await Payment.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
