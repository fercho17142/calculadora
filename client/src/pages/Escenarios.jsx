import { CheckCircle2, XCircle, Trophy } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useBet } from '../context/BetContext';
import { formatCOP, formatPercent, formatNumber } from '../utils/format';

export default function Escenarios() {
  const { scenariosData, error } = useBet();

  if (!scenariosData) {
    return <div className="card flex h-64 items-center justify-center text-slate-400">{error || 'Cargando escenarios…'}</div>;
  }

  const { scenarios } = scenariosData;

  const chartData = scenarios
    .map((s) => ({
      escenario: s.label,
      mejor: s.best.finalCapital,
      peor: s.worst.finalCapital,
    }))
    .reverse();

  return (
    <>
      <div className="card overflow-hidden p-0">
        <div className="border-b border-slate-800 px-5 py-4">
          <h2 className="text-lg font-bold text-white">Comparación de escenarios</h2>
          <p className="text-xs text-slate-400">
            Mejor caso (victorias primero) vs. peor caso (derrotas primero). Se resaltan los escenarios que alcanzan la meta.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Escenario</th>
                <th>Capital final (mejor)</th>
                <th>Capital final (peor)</th>
                <th>Ganancia neta</th>
                <th>Rentabilidad</th>
                <th>Total apostado</th>
                <th>Total recuperado</th>
                <th>Diferencia vs. meta</th>
                <th>¿Alcanza meta?</th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map((s) => {
                const achieved = s.best.goalAchieved;
                return (
                  <tr
                    key={s.label}
                    className={achieved ? 'bg-emerald-500/5 hover:bg-emerald-500/10' : 'hover:bg-slate-800/40'}
                  >
                    <td className="font-semibold text-white">
                      {s.wins}V / {s.losses}D
                    </td>
                    <td className="text-emerald-400">{formatCOP(s.best.finalCapital)}</td>
                    <td className="text-rose-300">{formatCOP(s.worst.finalCapital)}</td>
                    <td className={s.best.netGain >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      {formatCOP(s.best.netGain)}
                    </td>
                    <td>{formatPercent(s.best.profitability)}</td>
                    <td>{formatCOP(s.best.totalStaked)}</td>
                    <td>{formatCOP(s.best.totalReturned)}</td>
                    <td className={s.best.goalDifference >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      {formatCOP(s.best.goalDifference)}
                    </td>
                    <td>
                      {achieved ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Sí
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-700/40 px-2.5 py-1 text-xs font-semibold text-slate-400">
                          <XCircle className="h-3.5 w-3.5" /> No
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="mb-3 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-brand-500" />
          <h3 className="text-base font-bold text-white">Capital final por escenario</h3>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="escenario" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(v) => formatNumber(v, 0)} />
              <Tooltip formatter={(v) => formatCOP(v)} contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }} />
              <Legend wrapperStyle={{ color: '#94a3b8' }} />
              <Bar dataKey="mejor" name="Mejor caso" fill="#34d399" radius={[4, 4, 0, 0]} />
              <Bar dataKey="peor" name="Peor caso" fill="#fb7185" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}
