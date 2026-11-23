const express = require('express');
const { buildScenarios } = require('../engine/scenarios');
const { ValidationError } = require('../engine/mathEngine');

const router = express.Router();

/**
 * POST /api/scenarios
 * Body: { config: {...} }
 * Devuelve la comparación de escenarios (N victorias / N derrotas).
 */
router.post('/', (req, res) => {
  try {
    const output = buildScenarios((req.body && req.body.config) || req.body || {});
    res.json({ ok: true, data: output });
  } catch (err) {
    const status = err instanceof ValidationError ? 400 : 500;
    res.status(status).json({ ok: false, error: err.message });
  }
});

module.exports = router;
