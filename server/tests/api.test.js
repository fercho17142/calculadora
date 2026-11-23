const request = require('supertest');
const { createApp } = require('../src/app');

const app = createApp();

const validConfig = {
  initialCapital: 10000,
  odd: 2,
  totalBets: 8,
  goal: 1000000,
  mode: 'fixed',
  riskPercent: 10,
  wins: 4,
};

describe('API REST - integración', () => {
  test('GET /api/health responde ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.service).toBe('betcalculator-api');
  });

  test('GET /api/calculate/modes lista 4 modalidades', async () => {
    const res = await request(app).get('/api/calculate/modes');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(4);
  });

  test('POST /api/calculate/simulate con configuración válida', async () => {
    const res = await request(app)
      .post('/api/calculate/simulate')
      .send({ config: validConfig });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.bets).toHaveLength(8);
    expect(res.body.data.summary).toHaveProperty('finalCapital');
  });

  test('POST /api/calculate/simulate respeta secuencia de resultados enviada', async () => {
    const res = await request(app)
      .post('/api/calculate/simulate')
      .send({ config: validConfig, results: ['W', 'W', 'W', 'W', 'L', 'L', 'L', 'L'] });
    expect(res.status).toBe(200);
    expect(res.body.data.summary.wins).toBe(4);
    expect(res.body.data.summary.losses).toBe(4);
  });

  test('POST /api/calculate/simulate con cuota inválida responde 400', async () => {
    const res = await request(app)
      .post('/api/calculate/simulate')
      .send({ config: { ...validConfig, odd: 1 } });
    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
  });

  test('POST /api/scenarios devuelve comparación completa', async () => {
    const res = await request(app).post('/api/scenarios').send({ config: validConfig });
    expect(res.status).toBe(200);
    expect(res.body.data.scenarios).toHaveLength(9);
  });

  test('POST /api/probabilities devuelve probabilidades', async () => {
    const res = await request(app)
      .post('/api/probabilities')
      .send({ config: { ...validConfig, goal: 18000 }, estimatedProbability: 50 });
    expect(res.status).toBe(200);
    expect(res.body.data.impliedProbability).toBe(50);
    expect(res.body.data).toHaveProperty('probabilityToReachGoal');
  });

  test('CRUD de historial completo', async () => {
    const created = await request(app)
      .post('/api/history')
      .send({
        initialCapital: 10000,
        odd: 2,
        totalBets: 8,
        goal: 1000000,
        mode: 'fixed',
        riskPercent: 10,
        wins: 4,
        losses: 4,
        finalCapital: 10000,
        netGain: 0,
        profitability: 0,
        totalStaked: 8000,
        totalReturned: 8000,
        goalAchieved: false,
      });
    expect(created.status).toBe(201);
    const id = created.body.data.id;

    const listRes = await request(app).get('/api/history');
    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body.data)).toBe(true);

    const updated = await request(app)
      .put(`/api/history/${id}`)
      .send({ finalCapital: 12000, netGain: 2000, profitability: 20 });
    expect(updated.status).toBe(200);
    expect(updated.body.data.finalCapital).toBe(12000);

    const deleted = await request(app).delete(`/api/history/${id}`);
    expect(deleted.status).toBe(200);

    const missing = await request(app).get(`/api/history/${id}`);
    expect(missing.status).toBe(404);
  });

  test('ruta inexistente responde 404', async () => {
    const res = await request(app).get('/api/inexistente');
    expect(res.status).toBe(404);
  });
});
