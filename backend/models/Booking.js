const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  gym: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gym',
    required: true
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  className: {
    type: String,
    required: true
  },
  classTime: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true // YYYY-MM-DD
  },
  status: {
    type: String,
    enum: ['booked', 'cancelled'],
    default: 'booked'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Booking', BookingSchema);
