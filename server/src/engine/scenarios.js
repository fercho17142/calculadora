/**
 * Módulo de escenarios: compara diferentes combinaciones de
 * victorias y derrotas para un número total de apuestas.
 *
 * Para cada escenario se calculan dos variantes:
 *   - best  : todas las victorias primero (mejor caso por capitalización)
 *   - worst : todas las derrotas primero (peor caso)
 */

const { validateConfig, simulate } = require('./mathEngine');

function buildSequence(totalBets, wins) {
  const losses = totalBets - wins;
  const best = [];
  const worst = [];

  for (let i = 0; i < wins; i += 1) best.push('W');
  for (let i = 0; i < losses; i += 1) best.push('L');

  for (let i = 0; i < losses; i += 1) worst.push('L');
  for (let i = 0; i < wins; i += 1) worst.push('W');

  return { best, worst };
}

function buildScenarios(config) {
  const cfg = validateConfig(config);
  const scenarios = [];

  for (let w = cfg.totalBets; w >= 0; w -= 1) {
    const losses = cfg.totalBets - w;
    const { best, worst } = buildSequence(cfg.totalBets, w);

    const bestSim = simulate(cfg, best);
    const worstSim = simulate(cfg, worst);

    scenarios.push({
      wins: w,
      losses,
      label: `${w}V / ${losses}D`,
      best: bestSim.summary,
      worst: worstSim.summary,
    });
  }

  return { config: cfg, scenarios };
}

module.exports = { buildScenarios, buildSequence };
