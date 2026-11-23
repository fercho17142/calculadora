/**
 * Utilidades de formato para moneda colombiana (COP) y números.
 */

export function formatCOP(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return '$0';
  }
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value));
}

export function formatNumber(value, decimals = 2) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return '0';
  }
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(Number(value));
}

export function formatPercent(value, decimals = 2) {
  return `${formatNumber(value, decimals)}%`;
}

export function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}
