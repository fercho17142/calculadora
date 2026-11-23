const express = require('express');
const cors = require('cors');
const config = require('./config');
const historyService = require('./services/history.service');

const calculateRoutes = require('./routes/calculate.routes');
const scenariosRoutes = require('./routes/scenarios.routes');
const probabilitiesRoutes = require('./routes/probabilities.routes');
const historyRoutes = require('./routes/history.routes');

function createApp() {
  const app = express();

  app.use(cors({ origin: config.corsOrigins }));
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (req, res) => {
    res.json({
      ok: true,
      service: 'betcalculator-api',
      timestamp: new Date().toISOString(),
      database: historyService.getDbStatus(),
    });
  });

  app.use('/api/calculate', calculateRoutes);
  app.use('/api/scenarios', scenariosRoutes);
  app.use('/api/probabilities', probabilitiesRoutes);
  app.use('/api/history', historyRoutes);

  app.use((req, res) => {
    res.status(404).json({ ok: false, error: 'Ruta no encontrada.' });
  });

  // Manejador central de errores
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error('[Error]', err);
    res.status(500).json({ ok: false, error: err.message || 'Error interno del servidor.' });
  });

  return app;
}

module.exports = { createApp };
