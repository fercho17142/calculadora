/**
 * Módulo de probabilidades.
 *
 *   - Probabilidad implícita = (1 / cuota) × 100
 *   - Probabilidad estimada  = ingresada por el usuario (0-100)
 *   - Probabilidad de perder = 100 - estimada
 *   - Probabilidad de alcanzar la meta = P(X ≥ k) con distribución
 *     binomial, donde k es el número mínimo de victorias necesarias
 *     para alcanzar la meta (según la simulación del motor).
 *
 * La probabilidad implícita NO representa necesariamente la
 * probabilidad real. Las simulaciones no predicen resultados.
 */

const { roundMoney } = require('../utils/format');
const { validateConfig, simulate, buildResultsFromCounts } = require('./mathEngine');

function combination(n, k) {
  if (k < 0 || k > n) return 0;
  let kk = Math.min(k, n - k);
  let c = 1;
  for (let i = 0; i < kk; i += 1) {
    c = (c * (n - i)) / (i + 1);
  }
  return Math.round(c);
}

function binomialAtLeast(n, k, p) {
  if (k > n) return 0;
  if (k <= 0) return 1;
  let sum = 0;
  for (let j = k; j <= n; j += 1) {
    sum += combination(n, j) * Math.pow(p, j) * Math.pow(1 - p, n - j);
  }
  return sum;
}

/**
 * Determina el número mínimo de victorias necesarias para alcanzar
 * la meta, probando k = 0..totalBets con victorias al inicio.
 */
function minWinsToGoal(config) {
  const cfg = validateConfig(config);
  for (let w = 0; w <= cfg.totalBets; w += 1) {
    const seq = buildResultsFromCounts(cfg.totalBets, w);
    const sim = simulate(cfg, seq);
    if (sim.summary.goalAchieved) return w;
  }
  return null;
}

function calculateProbabilities(config, estimatedProbability) {
  const cfg = validateConfig(config);
  const estimated = Math.min(100, Math.max(0, Number(estimatedProbability) || 0));
  const implied = roundMoney((1 / cfg.odd) * 100);
  const p = estimated / 100;
  const minWins = minWinsToGoal(cfg);
  const probabilityToReachGoal =
    minWins === null ? 0 : roundMoney(binomialAtLeast(cfg.totalBets, minWins, p) * 100);

  return {
    config: cfg,
    impliedProbability: implied,
    estimatedProbability: roundMoney(estimated),
    lossProbability: roundMoney(100 - estimated),
    minWinsRequired: minWins,
    probabilityToReachGoal,
    disclaimer:
      'La probabilidad implícita no representa necesariamente la probabilidad real y las simulaciones no predicen resultados.',
  };
}

module.exports = { calculateProbabilities, impliedProbability: (odd) => roundMoney((1 / Number(odd)) * 100), combination, binomialAtLeast };
