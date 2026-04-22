const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.local_db);
    console.log('Database connected successfully!');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1); // Exit the process with failure
  }
};

module.exports = connectDB;
