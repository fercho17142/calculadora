import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import * as api from '../api/client';
import { extractError } from '../api/client';

const BetContext = createContext(null);

export const DEFAULT_CONFIG = {
  initialCapital: 10000,
  odd: 2,
  totalBets: 8,
  goal: 1000000,
  mode: 'fixed',
  riskPercent: 10,
  wins: 4,
  losses: 4,
};

function makeResults(cfg) {
  const total = Math.max(0, Number(cfg.totalBets) || 0);
  const wins = Math.max(0, Math.min(Number(cfg.wins) || 0, total));
  return Array.from({ length: total }, (_, i) => (i < wins ? 'W' : 'L'));
}

export function BetProvider({ children }) {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [customResults, setCustomResults] = useState(null);
  const [simData, setSimData] = useState(null);
  const [scenariosData, setScenariosData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const results = useMemo(
    () => customResults ?? makeResults(config),
    [config, customResults],
  );

  const updateConfig = useCallback((patch) => {
    setConfig((prev) => {
      const next = { ...prev, ...patch };
      if (patch.totalBets !== undefined || patch.wins !== undefined) {
        setCustomResults(null);
      }
      return next;
    });
  }, []);

  const toggleResult = useCallback(
    (index) => {
      setCustomResults((prev) => {
        const arr = [...(prev ?? makeResults(config))];
        arr[index] = arr[index] === 'W' ? 'L' : 'W';
        return arr;
      });
    },
    [config],
  );

  const resetResults = useCallback(() => {
    setCustomResults(null);
  }, []);

  const runSimulation = useCallback(async (cfg, res) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.simulate(cfg, res);
      setSimData(data);
      return data;
    } catch (err) {
      setError(extractError(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const runScenarios = useCallback(async (cfg) => {
    try {
      const data = await api.getScenarios(cfg);
      setScenariosData(data);
      return data;
    } catch (err) {
      setError(extractError(err));
      return null;
    }
  }, []);

  // Simulación y escenarios en tiempo real (con debounce).
  useEffect(() => {
    const timer = setTimeout(() => {
      runSimulation(config, results);
      runScenarios(config);
    }, 250);
    return () => clearTimeout(timer);
  }, [config, results, runSimulation, runScenarios]);

  const value = useMemo(
    () => ({
      config,
      results,
      simData,
      scenariosData,
      loading,
      error,
      updateConfig,
      toggleResult,
      resetResults,
      runSimulation,
      runScenarios,
    }),
    [
      config,
      results,
      simData,
      scenariosData,
      loading,
      error,
      updateConfig,
      toggleResult,
      resetResults,
      runSimulation,
      runScenarios,
    ],
  );

  return <BetContext.Provider value={value}>{children}</BetContext.Provider>;
}

export function useBet() {
  const ctx = useContext(BetContext);
  if (!ctx) {
    throw new Error('useBet debe usarse dentro de un BetProvider.');
  }
  return ctx;
}
