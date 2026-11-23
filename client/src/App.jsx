import { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Menu, Loader2 } from 'lucide-react';
import Sidebar from './components/Sidebar';
import { useBet } from './context/BetContext';
import Dashboard from './pages/Dashboard';
import Simulador from './pages/Simulador';
import Escenarios from './pages/Escenarios';
import Probabilidades from './pages/Probabilidades';
import Historial from './pages/Historial';

const TITLES = {
  '/': 'Dashboard',
  '/simulador': 'Simulador de apuestas',
  '/escenarios': 'Comparación de escenarios',
  '/probabilidades': 'Probabilidades',
  '/historial': 'Historial',
};

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { loading } = useBet();
  const location = useLocation();

  return (
    <div className="min-h-screen">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-slate-800 bg-surface-950/80 px-4 py-3 backdrop-blur lg:px-8">
          <button
            type="button"
            className="rounded-lg border border-slate-700 p-2 text-slate-300 hover:bg-slate-800 lg:hidden"
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-bold text-white">{TITLES[location.pathname] || 'BetCalculator Pro'}</h2>
          {loading && (
            <span className="ml-auto flex items-center gap-2 text-xs text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Calculando…
            </span>
          )}
        </header>

        <main className="mx-auto max-w-7xl space-y-6 p-4 lg:p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/simulador" element={<Simulador />} />
            <Route path="/escenarios" element={<Escenarios />} />
            <Route path="/probabilidades" element={<Probabilidades />} />
            <Route path="/historial" element={<Historial />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
