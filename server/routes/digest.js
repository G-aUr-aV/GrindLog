const express = require('express');
const router = express.Router();
const { runDailyDigest } = require('../services/dailyDigestService');

/**
 * @route   POST /api/digest/send
 * @desc    Manually triggers the daily digest email service.
 * @access  Public (in a real app, this should be protected)
 */
router.post('/send', (req, res) => {
    const { startDate, endDate } = req.body;
    console.log(`Manual trigger for daily digest received. Range: ${startDate} to ${endDate}`);
    try {
        // We run the digest in the background and immediately respond to the client,
        // as this can be a long-running task.
        runDailyDigest({ startDate, endDate });
        res.status(202).json({ message: 'Daily digest process has been triggered. Emails will be sent in the background.' });
    } catch (error) {
        console.error('Failed to trigger daily digest manually:', error);
        res.status(500).json({ message: 'Failed to trigger the daily digest process.' });
    }
});

module.exports = router;