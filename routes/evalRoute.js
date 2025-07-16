const express = require('express');
const router = express.Router();
const { runCode } = require('../utils/executeRunner'); // your existing code execution logic

// POST /evaluate
router.post('/evaluate', async (req, res) => {
  const { language, code, testCases } = req.body;
  if (!language || !code || !Array.isArray(testCases)) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const results = [];

  for (const test of testCases) {
    try {
      const result = await runCode(language, code, test.input);
      const passed = result.output.trim() === test.expected.trim();
      results.push({ input: test.input, expected: test.expected, output: result.output, passed });
    } catch (err) {
      results.push({ input: test.input, error: err.message, passed: false });
    }
  }

  res.json({ results });
});

module.exports = router;
