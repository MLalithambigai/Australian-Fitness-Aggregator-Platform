const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fitness_aggregator_db';
    await mongoose.connect(connStr);
    console.log(`MongoDB Connected: ${connStr}`);
  } catch (err) {
    console.error(`Database connection error: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
