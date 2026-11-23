/**
 * ============================================================
 * BetCalculator Pro - Motor matemático (núcleo puro)
 * ============================================================
 * Fórmulas implementadas:
 *   - Retorno bruto            = Apuesta × Cuota
 *   - Ganancia neta (victoria) = Apuesta × (Cuota - 1)
 *   - Pérdida (derrota)        = -Apuesta
 *   - Capital final            = Capital inicial + Σ ganancias netas - Σ pérdidas
 *
 * Modalidades:
 *   - fixed       : apuesta fija (Capital inicial × % riesgo, limitada al saldo)
 *   - total       : reinversión total (se apuesta todo el saldo disponible)
 *   - profit      : reinversión de ganancias (se conserva el capital inicial)
 *   - percentage  : porcentaje del capital (saldo disponible × % riesgo)
 *
 * Esta herramienta es solo de cálculo/simulación. No predice
 * resultados deportivos ni garantiza ganancias.
 * ============================================================
 */

const { roundMoney } = require('../utils/format');

const MODES = Object.freeze({
  FIXED: 'fixed',
  TOTAL: 'total',
  PROFIT: 'profit',
  PERCENTAGE: 'percentage',
});

const MODE_LABELS = Object.freeze({
  [MODES.FIXED]: 'Apuesta fija',
  [MODES.TOTAL]: 'Reinversión total',
  [MODES.PROFIT]: 'Reinversión de ganancias',
  [MODES.PERCENTAGE]: 'Porcentaje del capital',
});

const MAX_TOTAL_BETS = 100;

class ValidationError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

/**
 * Valida y normaliza la configuración de la simulación.
 * Lanza ValidationError con un mensaje legible si hay datos inválidos.
 */
function validateConfig(config = {}) {
  const errors = [];
  const initialCapital = Number(config.initialCapital);
  const odd = Number(config.odd);
  const totalBets = Number.parseInt(config.totalBets, 10);
  const goal = Number(config.goal);
  const riskPercent = Number(config.riskPercent);
  const mode = config.mode;

  if (!Number.isFinite(initialCapital) || initialCapital <= 0) {
    errors.push('El capital inicial debe ser un número mayor que 0.');
  }
  if (!Number.isFinite(odd) || odd <= 1) {
    errors.push('La cuota debe ser superior a 1.00.');
  }
  if (!Number.isInteger(totalBets) || totalBets < 1 || totalBets > MAX_TOTAL_BETS) {
    errors.push(`El número de apuestas debe ser un entero entre 1 y ${MAX_TOTAL_BETS}.`);
  }
  if (!Number.isFinite(goal) || goal < 0) {
    errors.push('La meta de ganancias no puede ser negativa.');
  }
  if (!Object.values(MODES).includes(mode)) {
    errors.push('Modalidad de apuesta no válida.');
  }
  if (!Number.isFinite(riskPercent) || riskPercent < 0 || riskPercent > 100) {
    errors.push('El porcentaje de riesgo debe estar entre 0 y 100.');
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join(' '));
  }

  return {
    initialCapital: roundMoney(initialCapital),
    odd: roundMoney(odd),
    totalBets,
    goal: roundMoney(goal),
    mode,
    riskPercent: roundMoney(riskPercent),
  };
}

/**
 * Calcula el valor a apostar según la modalidad.
 * Nunca retorna un valor superior al capital disponible.
 */
function computeStake(mode, capitalBefore, initialCapital, riskPercent) {
  if (capitalBefore <= 0) return 0;

  switch (mode) {
    case MODES.FIXED: {
      const fixedStake = roundMoney((initialCapital * riskPercent) / 100);
      return roundMoney(Math.min(fixedStake, capitalBefore));
    }
    case MODES.TOTAL:
      return roundMoney(capitalBefore);
    case MODES.PROFIT: {
      const accumulatedProfit = roundMoney(capitalBefore - initialCapital);
      if (accumulatedProfit > 0) {
        return roundMoney(Math.min(accumulatedProfit, capitalBefore));
      }
      // Sin ganancias acumuladas: apuesta semilla derivada del % de riesgo.
      const seed = roundMoney((initialCapital * riskPercent) / 100);
      return roundMoney(Math.min(seed, capitalBefore));
    }
    case MODES.PERCENTAGE:
      return roundMoney((capitalBefore * riskPercent) / 100);
    default:
      return 0;
  }
}

/**
 * Normaliza una secuencia de resultados a un arreglo de 'W' / 'L'.
 * Acepta true, 1, '1', 'W', 'win', 'ganada' como victoria.
 */
function normalizeResults(results, totalBets) {
  const arr = Array.isArray(results) ? results : [];
  const seq = [];
  for (let i = 0; i < totalBets; i += 1) {
    const raw = arr[i];
    const isWin =
      raw === 'W' ||
      raw === 'w' ||
      raw === true ||
      raw === 1 ||
      raw === '1' ||
      raw === 'win' ||
      raw === 'ganada';
    seq.push(isWin ? 'W' : 'L');
  }
  return seq;
}

/**
 * Construye una secuencia con N victorias al inicio y el resto derrotas
 * (caso conservador: las derrotas van al final).
 */
function buildResultsFromCounts(totalBets, wins) {
  const total = Number.parseInt(totalBets, 10) || 0;
  const w = Math.max(0, Math.min(Math.floor(Number(wins) || 0), total));
  const seq = [];
  for (let i = 0; i < total; i += 1) {
    seq.push(i < w ? 'W' : 'L');
  }
  return seq;
}

/**
 * Ejecuta la simulación completa de una secuencia de apuestas.
 * @param {object} config  Configuración (initialCapital, odd, totalBets, goal, mode, riskPercent)
 * @param {Array}  results Secuencia opcional de resultados ('W'/'L')
 * @returns {{ config: object, bets: Array, summary: object }}
 */
function simulate(config, results) {
  const cfg = validateConfig(config);
  const sequence = Array.isArray(results) && results.length > 0
    ? normalizeResults(results, cfg.totalBets)
    : buildResultsFromCounts(cfg.totalBets, config.wins);

  let capital = cfg.initialCapital;
  let totalStaked = 0;
  let totalReturned = 0;
  let wins = 0;
  let losses = 0;
  const bets = [];

  for (let i = 0; i < sequence.length; i += 1) {
    const isWin = sequence[i] === 'W';
    const capitalBefore = roundMoney(capital);

    let stake = computeStake(cfg.mode, capitalBefore, cfg.initialCapital, cfg.riskPercent);
    stake = roundMoney(Math.min(stake, capitalBefore));

    let grossReturn = 0;
    let net = 0;
    let result = 'sin_fondos';

    if (stake > 0) {
      totalStaked = roundMoney(totalStaked + stake);
      if (isWin) {
        grossReturn = roundMoney(stake * cfg.odd);
        net = roundMoney(stake * (cfg.odd - 1));
        capital = roundMoney(capital + net);
        totalReturned = roundMoney(totalReturned + grossReturn);
        wins += 1;
        result = 'ganada';
      } else {
        net = -stake;
        capital = roundMoney(capital - stake);
        losses += 1;
        result = 'perdida';
      }
    }

    bets.push({
      number: i + 1,
      capitalBefore,
      stake,
      odd: cfg.odd,
      result,
      grossReturn,
      net,
      capitalAfter: roundMoney(capital),
    });
  }

  const finalCapital = roundMoney(capital);
  const netGain = roundMoney(finalCapital - cfg.initialCapital);
  const profitability =
    cfg.initialCapital > 0 ? roundMoney((netGain / cfg.initialCapital) * 100) : 0;
  const goalDifference = roundMoney(finalCapital - cfg.goal);
  const completionPercent =
    cfg.goal > 0 ? roundMoney((finalCapital / cfg.goal) * 100) : 0;

  return {
    config: cfg,
    bets,
    summary: {
      initialCapital: cfg.initialCapital,
      finalCapital,
      netGain,
      profitability,
      totalStaked,
      totalReturned,
      wins,
      losses,
      goal: cfg.goal,
      goalAchieved: finalCapital >= cfg.goal,
      goalDifference,
      completionPercent,
    },
  };
}

module.exports = {
  MODES,
  MODE_LABELS,
  MAX_TOTAL_BETS,
  ValidationError,
  validateConfig,
  computeStake,
  normalizeResults,
  buildResultsFromCounts,
  simulate,
};
