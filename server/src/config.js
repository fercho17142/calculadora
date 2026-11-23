require('dotenv').config();

module.exports = {
  port: Number(process.env.SERVER_PORT) || 4000,
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  databaseUrl: process.env.DATABASE_URL || '',
};
