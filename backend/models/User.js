const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['member', 'owner', 'admin'],
    default: 'member'
  },
  membership: {
    plan: {
      type: String,
      enum: ['none', 'basic', 'premium', 'vip'],
      default: 'none'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'cancelled'],
      default: 'inactive'
    },
    startDate: {
      type: Date,
      default: null
    },
    endDate: {
      type: Date,
      default: null
    }
  },
  favoriteGyms: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gym'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('User', UserSchema);
