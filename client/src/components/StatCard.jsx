export default function StatCard({ title, value, icon: Icon, tone = 'default' }) {
  const tones = {
    default: 'text-brand-500 bg-brand-600/15',
    success: 'text-emerald-400 bg-emerald-500/15',
    danger: 'text-rose-400 bg-rose-500/15',
    warning: 'text-amber-400 bg-amber-500/15',
    info: 'text-sky-400 bg-sky-500/15',
  };

  return (
    <div className="card flex items-center gap-4 p-4">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tones[tone] || tones.default}`}>
        {Icon ? <Icon className="h-5 w-5" /> : null}
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs text-slate-400">{title}</p>
        <p className="truncate text-lg font-bold text-white">{value}</p>
      </div>
    </div>
  );
}
