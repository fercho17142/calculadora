import { useState } from 'react';
import { Save, RotateCcw, Target, CheckCircle2, XCircle, CircleDollarSign } from 'lucide-react';
import ConfigForm from '../components/ConfigForm';
import ResultsTable from '../components/ResultsTable';
import StatCard from '../components/StatCard';
import { useBet } from '../context/BetContext';
import * as api from '../api/client';
import { extractError } from '../api/client';
import { formatCOP, formatPercent, formatNumber } from '../utils/format';

export default function Simulador() {
  const { config, results, simData, updateConfig, toggleResult, resetResults } = useBet();
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('success');

  const notify = (text, type = 'success') => {
    setMessage(text);
    setMessageType(type);
    window.setTimeout(() => setMessage(null), 3500);
  };

  const saveToHistory = async () => {
    if (!simData) return;
    try {
      await api.createHistory({
        initialCapital: simData.summary.initialCapital,
        odd: Number(config.odd),
        totalBets: Number(config.totalBets),
        goal: simData.summary.goal,
        mode: config.mode,
        riskPercent: Number(config.riskPercent),
        wins: simData.summary.wins,
        losses: simData.summary.losses,
        finalCapital: simData.summary.finalCapital,
        netGain: simData.summary.netGain,
        profitability: simData.summary.profitability,
        totalStaked: simData.summary.totalStaked,
        totalReturned: simData.summary.totalReturned,
        goalAchieved: simData.summary.goalAchieved,
        resultsJson: simData.bets,
      });
      notify('Simulación guardada en el historial.');
    } catch (err) {
      notify(extractError(err), 'error');
    }
  };

  return (
    <>
      {message && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            messageType === 'success'
              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
              : 'border-rose-500/40 bg-rose-500/10 text-rose-300'
          }`}
        >
          {message}
        </div>
      )}

      <ConfigForm config={config} onChange={updateConfig} />

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className="btn-primary" onClick={saveToHistory} disabled={!simData}>
          <Save className="h-4 w-4" /> Guardar en historial
        </button>
        <button type="button" className="btn-secondary" onClick={resetResults}>
          <RotateCcw className="h-4 w-4" /> Restablecer resultados
        </button>
      </div>

      {simData && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Capital final" value={formatCOP(simData.summary.finalCapital)} icon={CircleDollarSign} tone="default" />
          <StatCard title="Ganancia neta" value={formatCOP(simData.summary.netGain)} icon={simData.summary.netGain >= 0 ? CheckCircle2 : XCircle} tone={simData.summary.netGain >= 0 ? 'success' : 'danger'} />
          <StatCard title="Rentabilidad" value={formatPercent(simData.summary.profitability)} icon={Target} tone={simData.summary.profitability >= 0 ? 'success' : 'danger'} />
          <StatCard title="Total apostado" value={formatCOP(simData.summary.totalStaked)} icon={Save} tone="info" />
        </div>
      )}

      <ResultsTable bets={simData?.bets || []} onToggleResult={toggleResult} />

      {simData && (
        <p className="text-xs text-slate-500">
          Secuencia actual: {formatNumber(simData.summary.wins, 0)} victorias · {formatNumber(simData.summary.losses, 0)} derrotas ·
          capital final {formatCOP(simData.summary.finalCapital)} · meta {simData.summary.goalAchieved ? 'alcanzada' : 'no alcanzada'}.
        </p>
      )}
    </>
  );
}
