import {
  Wallet,
  PiggyBank,
  Target,
  TrendingUp,
  TrendingDown,
  Trophy,
  Skull,
  Percent,
  Gauge,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useBet } from '../context/BetContext';
import StatCard from '../components/StatCard';
import { formatCOP, formatPercent, formatNumber } from '../utils/format';

const PIE_COLORS = { ganadas: '#34d399', perdidas: '#fb7185', 'sin fondos': '#64748b' };

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="card">
      <h3 className="text-base font-bold text-white">{title}</h3>
      {subtitle && <p className="mb-3 text-xs text-slate-400">{subtitle}</p>}
      <div className="h-72">{children}</div>
    </div>
  );
}

export default function Dashboard() {
  const { simData, scenariosData, error } = useBet();

  if (!simData) {
    return (
      <div className="card flex h-64 items-center justify-center text-slate-400">
        {error || 'Cargando simulación…'}
      </div>
    );
  }

  const { summary, bets } = simData;

  const gananciasAcumuladas = bets.reduce((acc, b) => acc + (b.net > 0 ? b.net : 0), 0);
  const perdidasAcumuladas = bets.reduce((acc, b) => acc + (b.net < 0 ? -b.net : 0), 0);
  const sinFondos = bets.filter((b) => b.result === 'sin_fondos').length;

  const evolutionData = bets.map((b) => ({
    apuesta: `A${b.number}`,
    capital: b.capitalAfter,
  }));

  const netData = bets.map((b) => ({
    apuesta: `A${b.number}`,
    retornoBruto: b.grossReturn,
    neto: b.net,
  }));

  const scenarioData = (scenariosData?.scenarios || [])
    .map((s) => ({ escenario: s.label, capitalFinal: s.best.finalCapital }))
    .slice()
    .reverse();

  const pieData = [
    { name: 'Ganadas', value: summary.wins },
    { name: 'Perdidas', value: summary.losses },
    { name: 'Sin fondos', value: sinFondos },
  ].filter((d) => d.value > 0);

  return (
    <>
      {error && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard title="Capital inicial" value={formatCOP(summary.initialCapital)} icon={Wallet} tone="info" />
        <StatCard title="Capital actual" value={formatCOP(summary.finalCapital)} icon={PiggyBank} tone="default" />
        <StatCard title="Meta económica" value={formatCOP(summary.goal)} icon={Target} tone="warning" />
        <StatCard title="Ganancias acumuladas" value={formatCOP(gananciasAcumuladas)} icon={TrendingUp} tone="success" />
        <StatCard title="Pérdidas acumuladas" value={formatCOP(perdidasAcumuladas)} icon={TrendingDown} tone="danger" />
        <StatCard title="% de cumplimiento" value={formatPercent(summary.completionPercent)} icon={Gauge} tone="info" />
        <StatCard title="Victorias" value={formatNumber(summary.wins, 0)} icon={Trophy} tone="success" />
        <StatCard title="Derrotas" value={formatNumber(summary.losses, 0)} icon={Skull} tone="danger" />
        <StatCard title="Rentabilidad" value={formatPercent(summary.profitability)} icon={Percent} tone={summary.profitability >= 0 ? 'success' : 'danger'} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Evolución del capital" subtitle="Capital disponible después de cada apuesta">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={evolutionData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="apuesta" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(v) => formatNumber(v, 0)} />
              <Tooltip formatter={(v) => formatCOP(v)} contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }} />
              <Line type="monotone" dataKey="capital" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Ganancias y pérdidas" subtitle="Retorno bruto vs. resultado neto por apuesta">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={netData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="apuesta" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(v) => formatNumber(v, 0)} />
              <Tooltip formatter={(v) => formatCOP(v)} contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }} />
              <Legend wrapperStyle={{ color: '#94a3b8' }} />
              <Bar dataKey="retornoBruto" name="Retorno bruto" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="neto" name="Neto" fill="#34d399" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Comparación de escenarios" subtitle="Capital final (mejor caso) según victorias/derrotas">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={scenarioData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="escenario" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(v) => formatNumber(v, 0)} />
              <Tooltip formatter={(v) => formatCOP(v)} contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }} />
              <Bar dataKey="capitalFinal" name="Capital final" fill="#818cf8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Resultados por apuesta" subtitle="Distribución de resultados de la secuencia">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} stroke="none">
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={PIE_COLORS[entry.name.toLowerCase()] || '#64748b'} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }} />
              <Legend wrapperStyle={{ color: '#94a3b8' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </>
  );
}
