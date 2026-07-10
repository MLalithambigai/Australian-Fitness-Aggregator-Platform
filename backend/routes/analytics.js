const express = require('express');
const router = express.Router();
const Gym = require('../models/Gym');
const User = require('../models/User');
const Booking = require('../models/Booking');
const CheckIn = require('../models/CheckIn');
const Payment = require('../models/Payment');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/analytics/owner
// @desc    Retrieve analytics for gym owner dashboard
router.get('/owner', protect, authorize(['owner', 'admin']), async (req, res) => {
  try {
    // 1. Find gyms owned by this user
    const gyms = await Gym.find({ owner: req.user.id });
    const gymIds = gyms.map(g => g._id);

    if (gyms.length === 0) {
      return res.json({
        hasGyms: false,
        totalGyms: 0,
        totalBookings: 0,
        totalCheckIns: 0,
        revenue: 0,
        visitorLog: [],
        charts: { checkinsOverTime: [], classPopularity: [] }
      });
    }

    // 2. Count total class bookings
    const totalBookings = await Booking.countDocuments({ gym: { $in: gymIds } });

    // 3. Count total check-ins
    const totalCheckIns = await CheckIn.countDocuments({ gym: { $in: gymIds }, status: 'valid' });

    // 4. Calculate revenue share (e.g. mock aggregator payout: $15.00 per checked-in member, plus booked classes)
    const revenue = totalCheckIns * 15.00;

    // 5. Recent Visitor Log
    const visitorLog = await CheckIn.find({ gym: { $in: gymIds } })
      .populate('user', 'name email')
      .populate('gym', 'name')
      .sort({ timestamp: -1 })
      .limit(10);

    // 6. Chart Data Generation
    // Checkins over the last 7 days
    const checkinsOverTime = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const start = new Date(d.setHours(0, 0, 0, 0));
      const end = new Date(d.setHours(23, 59, 59, 999));

      const count = await CheckIn.countDocuments({
        gym: { $in: gymIds },
        timestamp: { $gte: start, $lte: end },
        status: 'valid'
      });

      checkinsOverTime.push({
        day: start.toLocaleDateString('en-AU', { weekday: 'short' }),
        count
      });
    }

    // Class Popularity (Bookings count per class name)
    const classPopularityRaw = await Booking.aggregate([
      { $match: { gym: { $in: gymIds }, status: 'booked' } },
      { $group: { _id: '$className', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const classPopularity = classPopularityRaw.map(item => ({
      name: item._id,
      bookings: item.count
    }));

    // Gym capacity utilization metrics
    const gymCapacityStats = gyms.map(gym => {
      // simulate current check-in count as active users (e.g., check-ins in the last 2 hours)
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      return {
        id: gym._id,
        name: gym.name,
        capacity: gym.capacity,
        activeVisitors: Math.min(Math.floor(Math.random() * 25) + 5, gym.capacity), // simulation or checkins
        totalClasses: gym.classes.length
      };
    });

    res.json({
      hasGyms: true,
      totalGyms: gyms.length,
      totalBookings,
      totalCheckIns,
      revenue,
      visitorLog,
      gymCapacityStats,
      charts: {
        checkinsOverTime,
        classPopularity
      }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/analytics/admin
// @desc    Retrieve analytics for platform admin dashboard
router.get('/admin', protect, authorize(['admin']), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalMembers = await User.countDocuments({ role: 'member' });
    const totalOwners = await User.countDocuments({ role: 'owner' });
    const totalGyms = await Gym.countDocuments();
    const totalBookings = await Booking.countDocuments({ status: 'booked' });
    const totalCheckIns = await CheckIn.countDocuments({ status: 'valid' });

    // Aggregate payments
    const payments = await Payment.find().sort({ createdAt: -1 });
    const totalRevenue = payments.reduce((acc, curr) => acc + curr.amount, 0);

    // List of all gyms with owner names
    const gymsList = await Gym.find().populate('owner', 'name email');

    // List of users (excluding pass hashes)
    const usersList = await User.find().select('-passwordHash');

    // Payments logs
    const paymentsList = await Payment.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(10);

    // Daily revenue chart (last 7 days)
    const revenueOverTime = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const start = new Date(d.setHours(0, 0, 0, 0));
      const end = new Date(d.setHours(23, 59, 59, 999));

      const dayPayments = await Payment.find({
        createdAt: { $gte: start, $lte: end },
        status: 'success'
      });

      const daySum = dayPayments.reduce((acc, curr) => acc + curr.amount, 0);

      revenueOverTime.push({
        day: start.toLocaleDateString('en-AU', { weekday: 'short' }),
        revenue: parseFloat(daySum.toFixed(2))
      });
    }

    res.json({
      metrics: {
        totalUsers,
        totalMembers,
        totalOwners,
        totalGyms,
        totalBookings,
        totalCheckIns,
        totalRevenue: parseFloat(totalRevenue.toFixed(2))
      },
      gymsList,
      usersList,
      paymentsList,
      charts: {
        revenueOverTime
      }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/analytics/admin/users/:id/role
// @desc    Modify user role (Admin only)
router.post('/admin/users/:id/role', protect, authorize(['admin']), async (req, res) => {
  const { role } = req.body;
  if (!['member', 'owner', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role.' });
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.role = role;
    await user.save();
    res.json({ message: 'User role updated successfully.', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
