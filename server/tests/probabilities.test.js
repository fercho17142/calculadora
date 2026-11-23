const {
  calculateProbabilities,
  combination,
  binomialAtLeast,
} = require('../src/engine/probabilities');
const { MODES } = require('../src/engine/mathEngine');

describe('Módulo de probabilidades', () => {
  test('probabilidad implícita de cuota 2.00 es 50%', () => {
    const result = calculateProbabilities(
      { initialCapital: 10000, odd: 2, totalBets: 8, goal: 18000, mode: MODES.FIXED, riskPercent: 10 },
      50,
    );
    expect(result.impliedProbability).toBe(50);
  });

  test('probabilidad de perder = 100 - estimada', () => {
    const result = calculateProbabilities(
      { initialCapital: 10000, odd: 2, totalBets: 8, goal: 18000, mode: MODES.FIXED, riskPercent: 10 },
      60,
    );
    expect(result.lossProbability).toBe(40);
  });

  test('probabilidad de alcanzar meta: 8 victorias necesarias con p=0.5', () => {
    const result = calculateProbabilities(
      { initialCapital: 10000, odd: 2, totalBets: 8, goal: 18000, mode: MODES.FIXED, riskPercent: 10 },
      50,
    );
    // Para apuesta fija (1000/apuesta), alcanzar 18000 requiere 8 victorias.
    expect(result.minWinsRequired).toBe(8);
    expect(result.probabilityToReachGoal).toBeCloseTo(0.3906, 2); // 0.5^8
  });

  test('combination y binomialAtLeast', () => {
    expect(combination(8, 8)).toBe(1);
    expect(combination(5, 2)).toBe(10);
    expect(binomialAtLeast(3, 3, 0.5)).toBeCloseTo(0.125, 5);
  });
});
