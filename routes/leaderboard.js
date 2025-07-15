const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/leaderboard', async (req, res) => {
  try {
    const users = await User.find().sort({ totalScore: -1 }).limit(10);
    res.json(users);
  } catch (error) {
    console.error("Leaderboard fetch error:", error);
    res.status(500).json({ error: 'Failed to load leaderboard.' });
  }
});

module.exports = router;
