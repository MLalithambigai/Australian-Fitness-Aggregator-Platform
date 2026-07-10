const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Generate Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_fitness_key_987654', {
    expiresIn: '24h'
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please enter all fields.' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role: role || 'member'
    });

    res.status(201).json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        membership: user.membership
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user and get token
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter all fields.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    res.json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        membership: user.membership
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get user profile
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash').populate('favoriteGyms');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Request password reset link (simulated)
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User with this email does not exist.' });
    }
    // Simulate reset token
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'super_secret_fitness_key_987654', { expiresIn: '15m' });
    res.json({
      message: 'Password reset link simulated successfully.',
      resetToken // In a real application, this is emailed. We return it to make testing simple.
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password using reset token
router.post('/reset-password', async (req, res) => {
  const { resetToken, newPassword } = req.body;
  try {
    if (!resetToken || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required.' });
    }

    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET || 'super_secret_fitness_key_987654');
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password reset successful. You can now login.' });
  } catch (err) {
    res.status(400).json({ message: 'Expired or invalid token.' });
  }
});

module.exports = router;
