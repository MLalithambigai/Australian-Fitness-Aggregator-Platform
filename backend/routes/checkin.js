const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Gym = require('../models/Gym');
const CheckIn = require('../models/CheckIn');
const { protect } = require('../middleware/auth');

// @route   POST /api/checkin/generate-qr
// @desc    Generate a dynamic QR pass with 60-second expiry
router.post('/generate-qr', protect, async (req, res) => {
  const { gymId } = req.body;

  try {
    if (!gymId) {
      return res.status(400).json({ message: 'Gym ID is required to generate a pass.' });
    }

    // Verify gym exists
    const gym = await Gym.findById(gymId);
    if (!gym) {
      return res.status(404).json({ message: 'Gym not found.' });
    }

    // Verify user has active membership
    const user = await User.findById(req.user.id);
    if (!user.membership || user.membership.status !== 'active') {
      return res.status(403).json({ message: 'You must have an active membership subscription to generate a QR Pass.' });
    }

    // Generate signed token with 60 second expiration
    const payload = {
      userId: user._id,
      gymId: gym._id
    };

    const qrToken = jwt.sign(payload, process.env.JWT_SECRET || 'super_secret_fitness_key_987654', {
      expiresIn: '60s' // 60 seconds expiry!
    });

    res.json({ qrToken, expiresIn: 60 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/checkin/validate
// @desc    Scan and validate a QR Pass (simulates gym entry scanner)
router.post('/validate', async (req, res) => {
  const { qrToken } = req.body;

  if (!qrToken) {
    return res.status(400).json({ message: 'QR Code token is required.' });
  }

  try {
    // 1. Verify JWT (validates signature and 60-second expiry)
    let decoded;
    try {
      decoded = jwt.verify(qrToken, process.env.JWT_SECRET || 'super_secret_fitness_key_987654');
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(400).json({ status: 'expired', message: 'QR Code expired. Gym passes expire after 60 seconds for security.' });
      }
      return res.status(400).json({ status: 'invalid', message: 'Invalid QR Code token.' });
    }

    const { userId, gymId } = decoded;

    // Verify User and Gym exist
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const gym = await Gym.findById(gymId);
    if (!gym) {
      return res.status(404).json({ message: 'Gym not found.' });
    }

    // 2. One Gym Per Day Rule
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Find any valid check-ins for the user today
    const checkInsToday = await CheckIn.find({
      user: userId,
      timestamp: { $gte: startOfDay, $lte: endOfDay },
      status: 'valid'
    });

    if (checkInsToday.length > 0) {
      // Check if check-ins exist for a DIFFERENT gym
      const checkedInGymIds = checkInsToday.map(c => c.gym.toString());
      const hasDifferentGym = checkedInGymIds.some(id => id !== gymId.toString());

      if (hasDifferentGym) {
        // Find the gym name user visited today
        const firstCheckIn = checkInsToday.find(c => c.gym.toString() !== gymId.toString());
        const otherGym = await Gym.findById(firstCheckIn.gym);
        const otherGymName = otherGym ? otherGym.name : 'another gym';

        // Register check-in failure (as invalid)
        await CheckIn.create({
          user: userId,
          gym: gymId,
          qrCode: qrToken,
          status: 'invalid'
        });

        return res.status(400).json({
          status: 'rule_violation',
          message: `Check-in denied! You have already checked in at "${otherGymName}" today. Under the One Gym Per Day Rule, you cannot visit a different gym on the same day. Re-entry to "${otherGymName}" is allowed.`
        });
      }
    }

    // 3. Create check-in record
    const checkIn = await CheckIn.create({
      user: userId,
      gym: gymId,
      qrCode: qrToken,
      status: 'valid'
    });

    res.json({
      status: 'success',
      message: `Check-in successful! Welcome to ${gym.name}.`,
      checkIn: await checkIn.populate([
        { path: 'user', select: 'name email' },
        { path: 'gym', select: 'name city address' }
      ])
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/checkin/history
// @desc    Get check-in history of authenticated user
router.get('/history', protect, async (req, res) => {
  try {
    const history = await CheckIn.find({ user: req.user.id })
      .populate('gym', 'name city address')
      .sort({ timestamp: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
