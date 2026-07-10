const express = require('express');
const router = express.Router();
const Gym = require('../models/Gym');
const Booking = require('../models/Booking');
const { protect } = require('../middleware/auth');

// @route   POST /api/bookings/book
// @desc    Book a fitness class (checks capacity to prevent overbooking)
router.post('/book', protect, async (req, res) => {
  const { gymId, classId, date } = req.body;

  try {
    if (!gymId || !classId || !date) {
      return res.status(400).json({ message: 'Gym ID, Class ID, and Date are required.' });
    }

    // Verify gym exists
    const gym = await Gym.findById(gymId);
    if (!gym) {
      return res.status(404).json({ message: 'Gym not found.' });
    }

    // Find class inside gym classes
    const classObj = gym.classes.id(classId);
    if (!classObj) {
      return res.status(404).json({ message: 'Class not found in this gym.' });
    }

    // Check if user is already booked for this class on this date
    const existingBooking = await Booking.findOne({
      user: req.user.id,
      gym: gymId,
      classId: classId,
      date: date,
      status: 'booked'
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'You have already booked this class for this date.' });
    }

    // 1. Prevent Overbooking: Count current bookings for this class on this date
    const activeBookingCount = await Booking.countDocuments({
      gym: gymId,
      classId: classId,
      date: date,
      status: 'booked'
    });

    if (activeBookingCount >= classObj.capacity) {
      return res.status(400).json({ message: `Class is fully booked! Maximum capacity of ${classObj.capacity} has been reached.` });
    }

    // 2. Add user booking
    const booking = await Booking.create({
      user: req.user.id,
      gym: gymId,
      classId: classId,
      className: classObj.name,
      classTime: classObj.time,
      date: date,
      status: 'booked'
    });

    // 3. Update gym classes list with booked user
    if (!classObj.bookedUsers.includes(req.user.id)) {
      classObj.bookedUsers.push(req.user.id);
      await gym.save();
    }

    res.status(201).json({
      message: 'Class booked successfully!',
      booking
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/bookings/cancel/:id
// @desc    Cancel a booked class
router.post('/cancel/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    // Check authorization
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking.' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled.' });
    }

    // Update status
    booking.status = 'cancelled';
    await booking.save();

    // Remove user from Gym class bookedUsers
    const gym = await Gym.findById(booking.gym);
    if (gym) {
      const classObj = gym.classes.id(booking.classId);
      if (classObj) {
        const index = classObj.bookedUsers.indexOf(req.user.id);
        if (index > -1) {
          classObj.bookedUsers.splice(index, 1);
          await gym.save();
        }
      }
    }

    res.json({ message: 'Booking cancelled successfully.', booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/bookings/my
// @desc    Get user's class bookings
router.get('/my', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('gym', 'name address city')
      .sort({ date: 1, classTime: 1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
