/**
 * Utilidades de formato y redondeo monetario.
 * El redondeo a 2 decimales evita errores de punto flotante
 * sumando Number.EPSILON antes de multiplicar por 100.
 */

function roundMoney(value) {
  if (value === null || value === undefined || value === '' || Number.isNaN(Number(value))) {
    return 0;
  }
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function toFiniteNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

module.exports = { roundMoney, toFiniteNumber, clamp };
