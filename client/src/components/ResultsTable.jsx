import { Check, X, Ban } from 'lucide-react';
import { formatCOP, formatNumber } from '../utils/format';

function ResultBadge({ result, onToggle, index }) {
  const base =
    'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition focus:outline-none focus:ring-2';

  if (result === 'ganada') {
    return (
      <button
        type="button"
        onClick={() => onToggle(index)}
        className={`${base} bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/30 focus:ring-emerald-500/50`}
        title="Clic para cambiar a perdida"
      >
        <Check className="h-3.5 w-3.5" /> Ganada
      </button>
    );
  }
  if (result === 'perdida') {
    return (
      <button
        type="button"
        onClick={() => onToggle(index)}
        className={`${base} bg-rose-500/15 text-rose-400 hover:bg-rose-500/30 focus:ring-rose-500/50`}
        title="Clic para cambiar a ganada"
      >
        <X className="h-3.5 w-3.5" /> Perdida
      </button>
    );
  }
  return (
    <span className={`${base} bg-slate-700/40 text-slate-400`} title="Sin fondos disponibles">
      <Ban className="h-3.5 w-3.5" /> Sin fondos
    </span>
  );
}

export default function ResultsTable({ bets, onToggleResult }) {
  if (!bets || bets.length === 0) return null;

  return (
    <div className="card overflow-hidden p-0">
      <div className="border-b border-slate-800 px-5 py-4">
        <h2 className="text-lg font-bold text-white">Detalle de la simulación</h2>
        <p className="text-xs text-slate-400">
          Haz clic sobre cada resultado para modificarlo individualmente.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="table-base">
          <thead>
            <tr>
              <th>#</th>
              <th>Capital antes</th>
              <th>Valor apostado</th>
              <th>Cuota</th>
              <th>Resultado</th>
              <th>Retorno bruto</th>
              <th>Ganancia / pérdida</th>
              <th>Capital después</th>
            </tr>
          </thead>
          <tbody>
            {bets.map((b, idx) => (
              <tr key={b.number} className="hover:bg-slate-800/40">
                <td className="font-semibold text-slate-400">{b.number}</td>
                <td>{formatCOP(b.capitalBefore)}</td>
                <td>{formatCOP(b.stake)}</td>
                <td>{formatNumber(b.odd)}</td>
                <td>
                  <ResultBadge result={b.result} onToggle={onToggleResult} index={idx} />
                </td>
                <td className="text-emerald-400">{formatCOP(b.grossReturn)}</td>
                <td className={b.net >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {b.net >= 0 ? '+' : ''}
                  {formatCOP(b.net)}
                </td>
                <td className="font-semibold text-white">{formatCOP(b.capitalAfter)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
