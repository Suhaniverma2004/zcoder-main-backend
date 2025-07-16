const express = require('express');
const router = express.Router();
const UserCode = require('../models/UserCode');

// Save or update code
router.post('/save', async (req, res) => {
  const { userId, problemId, code, language } = req.body;

  if (!userId || !problemId || !code || !language) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const updated = await UserCode.findOneAndUpdate(
      { userId, problemId },
      { code, language },
      { upsert: true, new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Save failed', details: err });
  }
});

// Get saved code
router.get('/:problemId', async (req, res) => {
  const { userId } = req.query;
  const { problemId } = req.params;

  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  try {
    const saved = await UserCode.findOne({ userId, problemId });
    res.json(saved || {});
  } catch (err) {
    res.status(500).json({ error: 'Fetch failed' });
  }
});

module.exports = router;
