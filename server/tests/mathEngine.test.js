const {
  simulate,
  validateConfig,
  computeStake,
  buildResultsFromCounts,
  MODES,
  ValidationError,
} = require('../src/engine/mathEngine');

describe('Motor matemático - validaciones', () => {
  const base = {
    initialCapital: 10000,
    odd: 2,
    totalBets: 8,
    goal: 1000000,
    mode: MODES.FIXED,
    riskPercent: 10,
  };

  test('acepta una configuración válida', () => {
    const cfg = validateConfig(base);
    expect(cfg.initialCapital).toBe(10000);
    expect(cfg.totalBets).toBe(8);
  });

  test('rechaza cuota <= 1.00', () => {
    expect(() => validateConfig({ ...base, odd: 1 })).toThrow(ValidationError);
    expect(() => validateConfig({ ...base, odd: 0.8 })).toThrow(ValidationError);
  });

  test('rechaza capital inicial negativo o cero', () => {
    expect(() => validateConfig({ ...base, initialCapital: -5 })).toThrow(ValidationError);
    expect(() => validateConfig({ ...base, initialCapital: 0 })).toThrow(ValidationError);
  });

  test('rechaza total de apuestas inválido', () => {
    expect(() => validateConfig({ ...base, totalBets: 0 })).toThrow(ValidationError);
    expect(() => validateConfig({ ...base, totalBets: -1 })).toThrow(ValidationError);
  });

  test('rechaza modalidad inválida', () => {
    expect(() => validateConfig({ ...base, mode: 'otra' })).toThrow(ValidationError);
  });

  test('rechaza porcentaje de riesgo fuera de rango', () => {
    expect(() => validateConfig({ ...base, riskPercent: 120 })).toThrow(ValidationError);
    expect(() => validateConfig({ ...base, riskPercent: -5 })).toThrow(ValidationError);
  });
});

describe('Motor matemático - apuesta fija', () => {
  const config = {
    initialCapital: 10000,
    odd: 2,
    totalBets: 8,
    goal: 1000000,
    mode: MODES.FIXED,
    riskPercent: 10,
  };

  test('8 victorias: apuesta fija de 1000 en cada ronda', () => {
    const result = simulate(config, ['W', 'W', 'W', 'W', 'W', 'W', 'W', 'W']);
    expect(result.summary.finalCapital).toBe(18000);
    expect(result.summary.netGain).toBe(8000);
    expect(result.summary.profitability).toBe(80);
    expect(result.summary.wins).toBe(8);
    expect(result.summary.losses).toBe(0);
    expect(result.bets.every((b) => b.stake === 1000)).toBe(true);
  });

  test('4 victorias y 4 derrotas: neto cero', () => {
    const result = simulate(config, ['W', 'W', 'W', 'W', 'L', 'L', 'L', 'L']);
    expect(result.summary.finalCapital).toBe(10000);
    expect(result.summary.netGain).toBe(0);
    expect(result.summary.profitability).toBe(0);
  });

  test('capital insuficiente limita la apuesta al saldo', () => {
    const result = simulate(
      { ...config, initialCapital: 500, riskPercent: 100, totalBets: 1 },
      ['L'],
    );
    expect(result.bets[0].stake).toBe(500);
    expect(result.summary.finalCapital).toBe(0);
  });
});

describe('Motor matemático - reinversión total', () => {
  const config = {
    initialCapital: 10000,
    odd: 2,
    totalBets: 3,
    goal: 50000,
    mode: MODES.TOTAL,
    riskPercent: 10,
  };

  test('3 victorias consecutivas duplican el capital', () => {
    const result = simulate(config, ['W', 'W', 'W']);
    expect(result.summary.finalCapital).toBe(80000);
    expect(result.summary.netGain).toBe(70000);
    expect(result.bets[0].stake).toBe(10000);
    expect(result.bets[1].stake).toBe(20000);
    expect(result.bets[2].stake).toBe(40000);
  });

  test('una derrota en reinversión total deja el capital en cero', () => {
    const result = simulate(config, ['W', 'L', 'W']);
    expect(result.summary.finalCapital).toBe(0);
    expect(result.summary.wins).toBe(1);
    expect(result.summary.losses).toBe(1);
    expect(result.bets[2].stake).toBe(0);
    expect(result.bets[2].result).toBe('sin_fondos');
  });
});

describe('Motor matemático - porcentaje del capital', () => {
  test('50% del saldo: W luego L', () => {
    const result = simulate(
      {
        initialCapital: 10000,
        odd: 2,
        totalBets: 2,
        goal: 20000,
        mode: MODES.PERCENTAGE,
        riskPercent: 50,
      },
      ['W', 'L'],
    );
    expect(result.bets[0].stake).toBe(5000);
    expect(result.bets[0].capitalAfter).toBe(15000);
    expect(result.bets[1].stake).toBe(7500);
    expect(result.summary.finalCapital).toBe(7500);
    expect(result.summary.netGain).toBe(-2500);
  });
});

describe('Motor matemático - reinversión de ganancias', () => {
  test('conserva el capital inicial y reinvierte solo ganancias', () => {
    const result = simulate(
      {
        initialCapital: 10000,
        odd: 2,
        totalBets: 3,
        goal: 20000,
        mode: MODES.PROFIT,
        riskPercent: 10,
      },
      ['W', 'W', 'W'],
    );
    // 1ª: semilla 1000 -> capital 11000 (ganancia 1000)
    // 2ª: apuesta 1000  -> capital 12000
    // 3ª: apuesta 2000  -> capital 14000
    expect(result.bets[0].stake).toBe(1000);
    expect(result.bets[1].stake).toBe(1000);
    expect(result.bets[2].stake).toBe(2000);
    expect(result.summary.finalCapital).toBe(14000);
    expect(result.summary.netGain).toBe(4000);
  });
});

describe('Motor matemático - fórmulas puras', () => {
  test('computeStake nunca excede el capital disponible', () => {
    expect(computeStake(MODES.FIXED, 300, 10000, 10)).toBe(300);
    expect(computeStake(MODES.TOTAL, 300, 10000, 10)).toBe(300);
    expect(computeStake(MODES.PERCENTAGE, 300, 10000, 10)).toBe(30);
  });

  test('buildResultsFromCounts genera la secuencia correcta', () => {
    expect(buildResultsFromCounts(4, 2)).toEqual(['W', 'W', 'L', 'L']);
  });

  test('retorno bruto = apuesta × cuota y ganancia neta = apuesta × (cuota - 1)', () => {
    const result = simulate(
      { initialCapital: 1000, odd: 3.5, totalBets: 1, goal: 0, mode: MODES.FIXED, riskPercent: 100 },
      ['W'],
    );
    const bet = result.bets[0];
    expect(bet.grossReturn).toBe(3500);
    expect(bet.net).toBe(2500);
  });
});
