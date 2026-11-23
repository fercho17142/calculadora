const express = require('express');
const historyService = require('../services/history.service');
const { toCsv, toExcel, toPdf } = require('../utils/exporters');

const router = express.Router();

/**
 * GET /api/history/status
 * Indica si la persistencia en base de datos está disponible.
 */
router.get('/status', (req, res) => {
  res.json({ ok: true, data: historyService.getDbStatus() });
});

/**
 * GET /api/history?from=YYYY-MM-DD&to=YYYY-MM-DD
 * Lista el historial con filtro opcional por fechas.
 */
router.get('/', async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const records = await historyService.list({ from, to });
    res.json({ ok: true, data: records });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/history/export?format=csv|xlsx|pdf
 * Exporta el historial filtrado.
 */
router.get('/export', async (req, res, next) => {
  try {
    const { from, to, format = 'csv' } = req.query;
    const records = await historyService.list({ from, to });

    let buffer;
    let contentType;
    let filename;

    if (format === 'xlsx') {
      buffer = await toExcel(records);
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      filename = 'historial.xlsx';
    } else if (format === 'pdf') {
      buffer = await toPdf(records);
      contentType = 'application/pdf';
      filename = 'historial.pdf';
    } else {
      buffer = toCsv(records);
      contentType = 'text/csv; charset=utf-8';
      filename = 'historial.csv';
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/history/:id
 */
router.get('/:id', async (req, res, next) => {
  try {
    const record = await historyService.getById(req.params.id);
    if (!record) return res.status(404).json({ ok: false, error: 'Registro no encontrado.' });
    return res.json({ ok: true, data: record });
  } catch (err) {
    return next(err);
  }
});

/**
 * POST /api/history
 */
router.post('/', async (req, res, next) => {
  try {
    const record = await historyService.create(req.body || {});
    res.status(201).json({ ok: true, data: record });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/history/:id
 */
router.put('/:id', async (req, res, next) => {
  try {
    const record = await historyService.update(req.params.id, req.body || {});
    if (!record) return res.status(404).json({ ok: false, error: 'Registro no encontrado.' });
    return res.json({ ok: true, data: record });
  } catch (err) {
    return next(err);
  }
});

/**
 * DELETE /api/history/:id
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const removed = await historyService.remove(req.params.id);
    if (!removed) return res.status(404).json({ ok: false, error: 'Registro no encontrado.' });
    return res.json({ ok: true, data: { id: Number(req.params.id) } });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
