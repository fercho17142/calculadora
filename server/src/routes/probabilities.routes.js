const express = require('express');
const { calculateProbabilities } = require('../engine/probabilities');
const { ValidationError } = require('../engine/mathEngine');

const router = express.Router();

/**
 * POST /api/probabilities
 * Body: { config: {...}, estimatedProbability: number }
 */
router.post('/', (req, res) => {
  try {
    const { config = {}, estimatedProbability } = req.body || {};
    const output = calculateProbabilities(config, estimatedProbability);
    res.json({ ok: true, data: output });
  } catch (err) {
    const status = err instanceof ValidationError ? 400 : 500;
    res.status(status).json({ ok: false, error: err.message });
  }
});

module.exports = router;
