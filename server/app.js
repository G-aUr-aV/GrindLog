const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();


const { initializeDailyDigestService } = require('./services/dailyDigestService');

console.log('Application starting...');

// Initialize and start the daily digest service
initializeDailyDigestService();

const problemRoutes = require('./routes/problems');
const digestRoutes = require('./routes/digest');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/grindLog', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((error) => console.error('MongoDB connection error:', error));

// Routes
app.use('/api/problems', problemRoutes);
app.use('/api/digest', digestRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Problem Tracker API is running' });
});

module.exports = app;