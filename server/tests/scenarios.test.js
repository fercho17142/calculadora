const { buildScenarios } = require('../src/engine/scenarios');
const { MODES } = require('../src/engine/mathEngine');

describe('Módulo de escenarios', () => {
  const config = {
    initialCapital: 10000,
    odd: 2,
    totalBets: 8,
    goal: 1000000,
    mode: MODES.FIXED,
    riskPercent: 10,
  };

  test('genera totalBets + 1 escenarios', () => {
    const { scenarios } = buildScenarios(config);
    expect(scenarios).toHaveLength(9);
  });

  test('el escenario de todas victorias alcanza el mejor caso', () => {
    const { scenarios } = buildScenarios(config);
    const allWins = scenarios.find((s) => s.wins === 8);
    expect(allWins.best.finalCapital).toBe(18000);
    expect(allWins.worst.finalCapital).toBe(18000); // sin derrotas, best == worst
  });

  test('con derrotas, el mejor caso (victorias primero) supera o iguala al peor', () => {
    const { scenarios } = buildScenarios(config);
    scenarios.forEach((s) => {
      expect(s.best.finalCapital).toBeGreaterThanOrEqual(s.worst.finalCapital);
    });
  });

  test('escenario 4V/4D con apuesta fija: mejor y peor caso iguales', () => {
    const { scenarios } = buildScenarios(config);
    const s = scenarios.find((sc) => sc.wins === 4);
    expect(s.best.finalCapital).toBe(10000);
    expect(s.worst.finalCapital).toBe(10000);
  });
});
