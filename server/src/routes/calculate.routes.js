const express = require('express');
const {
  simulate,
  buildResultsFromCounts,
  MODES,
  MODE_LABELS,
  ValidationError,
} = require('../engine/mathEngine');

const router = express.Router();

/**
 * GET /api/calculate/modes
 * Lista las modalidades de apuesta disponibles.
 */
router.get('/modes', (req, res) => {
  res.json({
    ok: true,
    data: Object.values(MODES).map((id) => ({ id, label: MODE_LABELS[id] })),
  });
});

/**
 * POST /api/calculate/simulate
 * Body: { config: {...}, results: ['W','L',...]? }
 * Si no se envía `results`, se genera la secuencia a partir de
 * config.wins (victorias al inicio, derrotas al final).
 */
router.post('/simulate', (req, res) => {
  try {
    const { config = {}, results } = req.body || {};
    const sequence =
      Array.isArray(results) && results.length > 0
        ? results
        : buildResultsFromCounts(config.totalBets, config.wins);

    const output = simulate(config, sequence);
    res.json({ ok: true, data: output });
  } catch (err) {
    const status = err instanceof ValidationError ? 400 : 500;
    res.status(status).json({ ok: false, error: err.message });
  }
});

module.exports = router;
