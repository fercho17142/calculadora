import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Calculator,
  BarChart3,
  Percent,
  History,
  Dices,
  X,
} from 'lucide-react';

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/simulador', label: 'Simulador', icon: Calculator },
  { to: '/escenarios', label: 'Escenarios', icon: BarChart3 },
  { to: '/probabilidades', label: 'Probabilidades', icon: Percent },
  { to: '/historial', label: 'Historial', icon: History },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/60 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-slate-800 bg-surface-900 transition-transform duration-200 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 shadow-glow">
              <Dices className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white">BetCalculator</h1>
              <p className="text-xs text-brand-500">Pro · Simulador matemático</p>
            </div>
          </div>
          <button
            type="button"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 lg:hidden"
            onClick={onClose}
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-600/20 text-brand-500'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-800 p-4">
          <p className="text-[11px] leading-relaxed text-slate-500">
            Herramienta de cálculo y simulación. No garantiza ganancias ni recomienda apuestas.
          </p>
        </div>
      </aside>
    </>
  );
}
