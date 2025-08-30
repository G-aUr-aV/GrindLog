const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
  platform: {
    type: String,
    required: true,
    enum: ['LeetCode', 'Codeforces', 'CSES']
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Index for better query performance
problemSchema.index({ platform: 1, timestamp: -1 });

module.exports = mongoose.model('Problem', problemSchema);