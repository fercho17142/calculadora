import { useEffect, useState } from 'react';
import { Percent, Sigma, Scale, Trophy, Info } from 'lucide-react';
import StatCard from '../components/StatCard';
import { useBet } from '../context/BetContext';
import * as api from '../api/client';
import { extractError } from '../api/client';
import { formatPercent, formatNumber } from '../utils/format';

export default function Probabilidades() {
  const { config } = useBet();
  const [estimated, setEstimated] = useState(50);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const result = await api.getProbabilities(config, estimated);
        setData(result);
        setError(null);
      } catch (err) {
        setError(extractError(err));
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [config, estimated]);

  return (
    <>
      <div className="card">
        <h2 className="mb-4 text-lg font-bold text-white">Módulo de probabilidades</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="label" htmlFor="estimated">
              Tu probabilidad estimada de ganar (%)
            </label>
            <input
              id="estimated"
              type="number"
              min="0"
              max="100"
              step="1"
              value={estimated}
              onChange={(e) => setEstimated(e.target.value === '' ? '' : Number(e.target.value))}
              className="input"
            />
            <p className="mt-2 text-xs text-slate-500">
              Ingresa tu propia estimación de éxito por apuesta (0 - 100%).
            </p>
          </div>

          {error && (
            <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
              {error}
            </div>
          )}
        </div>
      </div>

      {data && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            title="Probabilidad implícita"
            value={formatPercent(data.impliedProbability)}
            icon={Percent}
            tone="info"
          />
          <StatCard
            title="Probabilidad estimada"
            value={formatPercent(data.estimatedProbability)}
            icon={Sigma}
            tone="default"
          />
          <StatCard
            title="Probabilidad de perder"
            value={formatPercent(data.lossProbability)}
            icon={Scale}
            tone="danger"
          />
          <StatCard
            title="Victorias mínimas para la meta"
            value={data.minWinsRequired === null ? 'Inalcanzable' : formatNumber(data.minWinsRequired, 0)}
            icon={Trophy}
            tone="warning"
          />
          <StatCard
            title="Probabilidad de alcanzar la meta"
            value={formatPercent(data.probabilityToReachGoal)}
            icon={Sigma}
            tone={data.probabilityToReachGoal >= 50 ? 'success' : 'warning'}
          />
        </div>
      )}

      <div className="card border-amber-500/30 bg-amber-500/5">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
          <div className="text-sm text-amber-200/90">
            <p className="font-semibold text-amber-300">Aclaración importante</p>
            <p className="mt-1 leading-relaxed">
              La probabilidad implícita (1 / cuota) × 100 es solo una conversión matemática de la cuota y{' '}
              <strong>no representa necesariamente la probabilidad real</strong> del evento. Las simulaciones
              no predicen resultados deportivos. La probabilidad de alcanzar la meta se calcula con una
              distribución binomial usando tu probabilidad estimada.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
