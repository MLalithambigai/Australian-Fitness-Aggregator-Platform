const mongoose = require('mongoose');

const ClassSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  instructor: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true // e.g. '09:00 AM - 10:00 AM'
  },
  capacity: {
    type: Number,
    required: true,
    default: 20
  },
  bookedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
});

const GymSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  rating: {
    type: Number,
    default: 4.5
  },
  images: [{
    type: String
  }],
  facilities: [{
    type: String
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  capacity: {
    type: Number,
    required: true,
    default: 100
  },
  classes: [ClassSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Gym', GymSchema);
