const { createApp } = require('./app');
const config = require('./config');
const historyService = require('./services/history.service');

const app = createApp();

app.listen(config.port, () => {
  const db = historyService.getDbStatus();
  console.log('============================================');
  console.log('  BetCalculator Pro API');
  console.log(`  URL:        http://localhost:${config.port}/api`);
  console.log(`  CORS:       ${config.corsOrigins.join(', ')}`);
  console.log(`  Base datos: ${db.available ? 'PostgreSQL (Prisma)' : 'En memoria (respaldo)'}`);
  console.log('============================================');
});
