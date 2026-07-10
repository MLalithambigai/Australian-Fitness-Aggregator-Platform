const mongoose = require('mongoose');

const CheckInSchema = new mongoose.Schema({
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
  timestamp: {
    type: Date,
    default: Date.now
  },
  qrCode: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['valid', 'expired', 'invalid'],
    default: 'valid'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CheckIn', CheckInSchema);
